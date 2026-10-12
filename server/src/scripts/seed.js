import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database.js';
import { Event } from '../models/Event.js';

const DEMO_PAGES = [
  'http://localhost:8080/index.html',
  'http://localhost:8080/pricing.html'
];

async function seed() {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  console.log('[Seed] Clearing existing demo events...');
  await Event.deleteMany({});

  const sampleEvents = [];
  const baseTime = Date.now() - 3600000; // 1 hour ago

  // 1. Session 1: Buyer exploring hero & purchasing Growth plan
  const s1 = 'sess_buyer_growth_984';
  sampleEvents.push({
    session_id: s1,
    event_type: 'page_view',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 10000),
    viewport: { width: 1440, height: 900 }
  });
  sampleEvents.push({
    session_id: s1,
    event_type: 'click',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 35000),
    coordinates: { x: 520, y: 310 }, // Hero CTA button
    viewport: { width: 1440, height: 900 }
  });
  sampleEvents.push({
    session_id: s1,
    event_type: 'click',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 75000),
    coordinates: { x: 740, y: 310 }, // Compare pricing button
    viewport: { width: 1440, height: 900 }
  });
  sampleEvents.push({
    session_id: s1,
    event_type: 'page_view',
    page_url: DEMO_PAGES[1],
    timestamp: new Date(baseTime + 80000),
    viewport: { width: 1440, height: 900 }
  });
  sampleEvents.push({
    session_id: s1,
    event_type: 'click',
    page_url: DEMO_PAGES[1],
    timestamp: new Date(baseTime + 120000),
    coordinates: { x: 600, y: 550 }, // Select Growth button
    viewport: { width: 1440, height: 900 }
  });

  // 2. Session 2: Feature researcher clicking cards
  const s2 = 'sess_researcher_412';
  sampleEvents.push({
    session_id: s2,
    event_type: 'page_view',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 300000),
    viewport: { width: 1280, height: 800 }
  });
  sampleEvents.push({
    session_id: s2,
    event_type: 'click',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 330000),
    coordinates: { x: 300, y: 520 }, // Feature Card 1
    viewport: { width: 1280, height: 800 }
  });
  sampleEvents.push({
    session_id: s2,
    event_type: 'click',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 370000),
    coordinates: { x: 640, y: 520 }, // Feature Card 2
    viewport: { width: 1280, height: 800 }
  });
  sampleEvents.push({
    session_id: s2,
    event_type: 'click',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 410000),
    coordinates: { x: 960, y: 520 }, // Feature Card 3
    viewport: { width: 1280, height: 800 }
  });

  // 3. Session 3: Hotspot cluster around Hero CTA
  const s3 = 'sess_hotspot_user_550';
  sampleEvents.push({
    session_id: s3,
    event_type: 'page_view',
    page_url: DEMO_PAGES[0],
    timestamp: new Date(baseTime + 600000),
    viewport: { width: 1440, height: 900 }
  });
  // Multiple overlapping clicks on the Hero Trial button to demonstrate heatmap density
  for (let i = 0; i < 6; i++) {
    sampleEvents.push({
      session_id: s3,
      event_type: 'click',
      page_url: DEMO_PAGES[0],
      timestamp: new Date(baseTime + 610000 + i * 5000),
      coordinates: { 
        x: 520 + Math.floor((Math.random() - 0.5) * 30), 
        y: 310 + Math.floor((Math.random() - 0.5) * 15) 
      },
      viewport: { width: 1440, height: 900 }
    });
  }

  // 4. Session 4: Mobile visitor on Pricing
  const s4 = 'sess_mobile_vis_109';
  sampleEvents.push({
    session_id: s4,
    event_type: 'page_view',
    page_url: DEMO_PAGES[1],
    timestamp: new Date(baseTime + 900000),
    viewport: { width: 390, height: 844 }
  });
  sampleEvents.push({
    session_id: s4,
    event_type: 'click',
    page_url: DEMO_PAGES[1],
    timestamp: new Date(baseTime + 920000),
    coordinates: { x: 200, y: 480 },
    viewport: { width: 390, height: 844 }
  });

  await Event.insertMany(sampleEvents);
  console.log(`[Seed] Successfully inserted ${sampleEvents.length} realistic events across 4 sessions!`);
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Error seeding database:', err);
  process.exit(1);
});
