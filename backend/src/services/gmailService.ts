import { google } from 'googleapis';
import User from '../models/User';

const getGmailClient = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || !user.refreshToken) {
    throw new Error('User not found or no refresh token available');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: user.refreshToken,
    access_token: user.accessToken,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

export const listEmails = async (userId: string, maxResults = 20, pageToken?: string, q?: string) => {
  const gmail = await getGmailClient(userId);
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    pageToken,
    q,
  });

  const messages = response.data.messages || [];
  
  // Fetch details for each message
  const detailedMessages = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });
      return detail.data;
    })
  );

  return {
    messages: detailedMessages,
    nextPageToken: response.data.nextPageToken,
    resultSizeEstimate: response.data.resultSizeEstimate,
  };
};

export const getEmail = async (userId: string, messageId: string) => {
  const gmail = await getGmailClient(userId);
  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });
  return response.data;
};

export const sendEmail = async (userId: string, to: string, subject: string, body: string, threadId?: string, inReplyTo?: string) => {
  const gmail = await getGmailClient(userId);
  
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
  ];

  if (inReplyTo) {
    messageParts.push(`In-Reply-To: ${inReplyTo}`);
    messageParts.push(`References: ${inReplyTo}`);
  }

  messageParts.push('', body);
  const message = messageParts.join('\n');
  
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
      ...(threadId && { threadId }),
    },
  });

  return response.data;
};

export const modifyEmail = async (userId: string, messageId: string, addLabelIds: string[], removeLabelIds: string[]) => {
  const gmail = await getGmailClient(userId);
  const response = await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds,
      removeLabelIds,
    },
  });
  return response.data;
};
