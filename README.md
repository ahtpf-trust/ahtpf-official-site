# Hindu Trust Portal - Next.js & Supabase Prototype

This repository contains the prototype for a modernized, professional volunteer registration portal designed for a Hindu Trust. It is engineered to run completely **free of cost** using Next.js on Vercel and a Supabase backend.

## 🚀 Key Features Demonstrated
1.  **Public Registration Form:** Registers members with Name, Phone, Profile Photo, and ID Proof.
2.  **Webcam & File Upload Integration:** Configured to handle file uploads securely.
3.  **Two-Bucket Security System:**
    *   `member-photos` (Public Bucket): Stores public-facing profile photos.
    *   `id-proofs` (Private Bucket): Stores sensitive ID cards. Access is blocked to the public.
4.  **Admin Review Dashboard:** Allows administrators to view submissions, securely load private ID documents via short-lived signed URLs, and approve registrations (generating a 16-digit membership number).

---

## 🛠️ Step-by-Step Setup Guide

Follow these steps to connect the prototype to your live Supabase backend:

### Step 1: Initialize Your Supabase Database & Buckets
1.  Go to your [Supabase Console](https://supabase.com) and select/create a free project.
2.  In the left sidebar, click on **SQL Editor** -> **New Query**.
3.  Copy all commands from the [`supabase_setup.sql`](./supabase_setup.sql) file in this directory.
4.  Paste them into the SQL editor and click **Run**.
5.  *This will automatically create your `members` table, create the public/private storage buckets, and apply security policies.*

### Step 2: Configure Environment Keys
1.  In your Supabase project, navigate to **Project Settings** -> **API** in the left sidebar.
2.  Retrieve the following keys:
    *   `Project URL`
    *   `Project API Keys -> anon (public)`
    *   `Project API Keys -> service_role (secret)`
3.  Open the file `.env.local` in this directory (which currently contains mock credentials) and replace the values with your actual keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```

### Step 3: Run the Application Locally
Open your terminal in this project directory and run the following commands:

```bash
# Run the local Next.js development server
npm run dev
```

Your app will be running at [http://localhost:3000](http://localhost:3000).
*   **Public Form:** `/`
*   **Admin Dashboard:** `/admin`

---

## ☁️ How to Deploy to Vercel (For Free)

1.  Push this folder to a private repository on your **GitHub** account.
2.  Log in to [Vercel](https://vercel.com) using your GitHub account.
3.  Click **Add New...** -> **Project**.
4.  Import your repository.
5.  In the **Environment Variables** accordion section during setup, add the three keys from your `.env.local` file:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY`
6.  Click **Deploy**. Vercel will host your site for free with continuous Git deployments!
