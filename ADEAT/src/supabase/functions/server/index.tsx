import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configure CORS to allow all origins
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Configure logging
app.use('*', logger(console.log));

// Initialize Supabase client with service role key for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Initialize Supabase client for auth operations
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// Create storage bucket for images on startup
async function initializeStorage() {
  try {
    const supabase = getSupabaseAdmin();
    const bucketName = 'make-bd1430c4-notes-images';
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB limit
      });
      if (error) {
        console.log(`Storage bucket creation error: ${error.message}`);
      } else {
        console.log('Storage bucket created successfully');
      }
    } else {
      console.log('Storage bucket already exists');
    }
  } catch (error) {
    console.log(`Error initializing storage: ${error}`);
  }
}

// Initialize storage on server start
initializeStorage();

// Helper function to verify user authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'No authorization header', userId: null };
  }
  
  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', userId: null };
  }
  
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user?.id) {
    return { error: 'Unauthorized', userId: null };
  }
  
  return { error: null, userId: user.id };
}

// ===== AUTH ROUTES =====

// Sign up route
app.post('/make-server-bd1430c4/auth/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    
    if (!name || !email || !password) {
      return c.json({ error: 'Name, email, and password are required' }, 400);
    }
    
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true,
    });
    
    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile in KV store
    await kv.set(`user:${data.user.id}:profile`, {
      name,
      email,
      memberSince: new Date().toISOString(),
    });
    
    return c.json({ 
      user: { 
        id: data.user.id, 
        email: data.user.email,
        name 
      } 
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Sign in route - handled by Supabase client in frontend
// Just verify session endpoint
app.get('/make-server-bd1430c4/auth/verify', async (c) => {
  const authResult = await verifyAuth(c.req.header('Authorization'));
  
  if (authResult.error) {
    return c.json({ error: authResult.error }, 401);
  }
  
  // Get user profile
  const profile = await kv.get(`user:${authResult.userId}:profile`);
  
  return c.json({ 
    userId: authResult.userId,
    profile 
  });
});

// ===== NOTES ROUTES =====

// Get all notes for a user
app.get('/make-server-bd1430c4/notes', async (c) => {
  const authResult = await verifyAuth(c.req.header('Authorization'));
  
  if (authResult.error) {
    return c.json({ error: authResult.error }, 401);
  }
  
  try {
    const notesPrefix = `user:${authResult.userId}:note:`;
    const notes = await kv.getByPrefix(notesPrefix);
    
    // Sort by updatedAt descending
    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return c.json({ notes: sortedNotes });
  } catch (error) {
    console.log(`Error fetching notes: ${error}`);
    return c.json({ error: 'Failed to fetch notes' }, 500);
  }
});

// Create a new note
app.post('/make-server-bd1430c4/notes', async (c) => {
  const authResult = await verifyAuth(c.req.header('Authorization'));
  
  if (authResult.error) {
    return c.json({ error: authResult.error }, 401);
  }
  
  try {
    const { title, content } = await c.req.json();
    
    const noteId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const note = {
      id: noteId,
      title: title || '',
      content: content || '',
      createdAt: now,
      updatedAt: now,
    };
    
    await kv.set(`user:${authResult.userId}:note:${noteId}`, note);
    
    return c.json({ note });
  } catch (error) {
    console.log(`Error creating note: ${error}`);
    return c.json({ error: 'Failed to create note' }, 500);
  }
});

// Update a note
app.put('/make-server-bd1430c4/notes/:noteId', async (c) => {
  const authResult = await verifyAuth(c.req.header('Authorization'));
  
  if (authResult.error) {
    return c.json({ error: authResult.error }, 401);
  }
  
  try {
    const noteId = c.req.param('noteId');
    const updates = await c.req.json();
    
    const noteKey = `user:${authResult.userId}:note:${noteId}`;
    const existingNote = await kv.get(noteKey);
    
    if (!existingNote) {
      return c.json({ error: 'Note not found' }, 404);
    }
    
    const updatedNote = {
      ...existingNote,
      ...updates,
      id: noteId, // Preserve ID
      createdAt: existingNote.createdAt, // Preserve creation time
      updatedAt: Date.now(),
    };
    
    await kv.set(noteKey, updatedNote);
    
    return c.json({ note: updatedNote });
  } catch (error) {
    console.log(`Error updating note: ${error}`);
    return c.json({ error: 'Failed to update note' }, 500);
  }
});

// Delete a note
app.delete('/make-server-bd1430c4/notes/:noteId', async (c) => {
  const authResult = await verifyAuth(c.req.header('Authorization'));
  
  if (authResult.error) {
    return c.json({ error: authResult.error }, 401);
  }
  
  try {
    const noteId = c.req.param('noteId');
    const noteKey = `user:${authResult.userId}:note:${noteId}`;
    
    await kv.del(noteKey);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting note: ${error}`);
    return c.json({ error: 'Failed to delete note' }, 500);
  }
});

// Delete all notes for a user
app.delete('/make-server-bd1430c4/notes', async (c) => {
  const authResult = await verifyAuth(c.req.header('Authorization'));
  
  if (authResult.error) {
    return c.json({ error: authResult.error }, 401);
  }
  
  try {
    const notesPrefix = `user:${authResult.userId}:note:`;
    const notes = await kv.getByPrefix(notesPrefix);
    
    const noteKeys = notes.map(note => `user:${authResult.userId}:note:${note.id}`);
    
    if (noteKeys.length > 0) {
      await kv.mdel(noteKeys);
    }
    
    return c.json({ success: true, deletedCount: noteKeys.length });
  } catch (error) {
    console.log(`Error deleting all notes: ${error}`);
    return c.json({ error: 'Failed to delete all notes' }, 500);
  }
});

// ===== IMAGE UPLOAD ROUTES =====

// Upload an image
app.post('/make-server-bd1430c4/images/upload', async (c) => {
  const authResult = await verifyAuth(c.req.header('Authorization'));
  
  if (authResult.error) {
    return c.json({ error: authResult.error }, 401);
  }
  
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    
    if (!file || typeof file === 'string') {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const fileName = `${authResult.userId}/${Date.now()}-${file.name}`;
    const supabase = getSupabaseAdmin();
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('make-bd1430c4-notes-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.log(`Image upload error: ${error.message}`);
      return c.json({ error: 'Failed to upload image' }, 500);
    }
    
    // Create signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from('make-bd1430c4-notes-images')
      .createSignedUrl(fileName, 31536000); // 1 year in seconds
    
    return c.json({ 
      url: signedUrlData?.signedUrl,
      path: fileName 
    });
  } catch (error) {
    console.log(`Error uploading image: ${error}`);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// Health check
app.get('/make-server-bd1430c4/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);