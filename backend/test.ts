import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const testE2E = async () => {
  try {
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB Connected!');

    console.log('2. Fetching User from DB...');
    const db = mongoose.connection.useDb('test');
    const user = await db.collection('users').findOne({});
    
    if (!user) {
      console.log('No user found! Cannot test without an authenticated user.');
      process.exit(1);
    }
    console.log(`Found user: ${user.email}`);

    console.log('3. Generating JWT Token...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('4. Testing GET /api/emails...');
    const emailsRes = await api.get('/emails');
    const emails = emailsRes.data.messages;
    console.log(`Successfully fetched ${emails.length} emails!`);

    if (emails.length > 0) {
      const emailId = emails[0].id;
      console.log(`\n5. Testing GET /api/emails/${emailId} (Fetching full email)...`);
      const singleEmailRes = await api.get(`/emails/${emailId}`);
      console.log(`Successfully fetched full email! Subject: ${singleEmailRes.data.payload?.headers?.find((h: any) => h.name === 'Subject')?.value}`);
      
      console.log('\n6. Testing AI Summarization (POST /api/ai/summarize)...');
      const summarizeRes = await api.post('/ai/summarize', { content: 'This is a test email thread about a meeting tomorrow at 10 AM.' });
      console.log(`AI Summary Response: ${summarizeRes.data.summary}`);

      console.log('\n7. Testing AI Reply (POST /api/ai/reply)...');
      const replyRes = await api.post('/ai/reply', { content: 'Hey, are we still meeting tomorrow?', tone: 'professional' });
      console.log(`AI Reply Response:\n${replyRes.data.reply}`);
    }

    console.log('\n✅ ALL E2E TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ E2E TEST FAILED!');
    console.error(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    process.exit(1);
  }
};

testE2E();
