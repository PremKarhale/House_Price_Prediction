# 🚀 Deployment Guide: Gurgaon Real Estate Estimator

This guide walks you through deploying your full-stack application for free using **Render** (Backend API) and **Vercel** (Frontend UI).

## Prerequisites
Before you start, make sure your final code is safely uploaded to your main GitHub repository. Open a terminal in the main project folder (`House_Price_Prediction`) and run:
```bash
git add .
git commit -m "Finalizing ensemble model and preparing for deployment"
git push
```

## Step 1: Deploy Backend to Render (Free)
Your data-crunching machine learning API will be hosted on Render.
1. Go to [Render.com](https://render.com) and sign in.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `House_Price_Prediction` repository.
4. Fill out the configuration settings exactly as follows:
   - **Name:** *Any name you like (e.g., gurgaon-house-backend)*
   - **Root Directory:** `housePrice_backend` *(Crucial! Do not skip this)*
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Choose the **Free** instance type.
6. Click **Deploy Web Service** at the bottom of the page. 
7. Sit back and wait roughly 2-5 minutes for it to build. Once you see the green `Live` badge, **copy the URL provided** near the top left (e.g., `https://gurgaon-house-backend.onrender.com`).

---

## Step 2: Deploy Frontend to Vercel (Free)
Your beautiful premium React UI will be hosted on Vercel.
1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New...** and choose **Project**.
3. Import the exact same `House_Price_Prediction` GitHub repository.
4. In the setup screen under **Configure Project**:
   - Click **Edit** next to **Root Directory** and select `housePrice_frontend` *(Crucial! Vercel needs to know where the UI code lives)*.
   - The Framework Preset should automatically switch to "Vite".
5. Expand the **Environment Variables** tab and enter:
   - **Name:** `VITE_API_URL`
   - **Value:** *Paste the Render URL you copied in Step 1 (e.g., `https://gurgaon-house-backend.onrender.com`). Make sure there is no trailing slash `/` at the very end!*
6. Click **Deploy**! 

Vercel will quickly build your frontend. Once finished, it will provide your final live website URL that you can share with the world, run on your mobile phone, or put directly on your resume! 🎉
