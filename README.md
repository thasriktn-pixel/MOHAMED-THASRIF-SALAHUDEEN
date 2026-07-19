# TS Workshop Manager — Installation Guide

This guide will walk you through downloading, installing, and running **TS Workshop Manager** locally on your laptop or computer.

---

## 📋 Prerequisites

Before you begin, ensure your laptop has the following installed:

1. **Node.js (v18.0.0 or higher)**
   - Download and install it from [nodejs.org](https://nodejs.org/).
   - This includes **npm** (Node Package Manager) which is required to install dependencies.
2. **A Web Browser** (such as Google Chrome, Microsoft Edge, Safari, or Firefox).

---

## 🚀 Step-by-Step Installation

### Step 1: Export the Project Files
1. In the **Google AI Studio Build** interface, look at the top-right corner.
2. Click on the **Settings/Menu** icon.
3. Select **Export to ZIP** to download the complete codebase to your computer, or choose **Export to GitHub** if you prefer to push it to a repository.
4. If you downloaded a ZIP, extract/unzip the file to a folder of your choice (e.g., `Desktop/TS-Workshop-Manager`).

---

### Step 2: Open Terminal / Command Prompt
1. Open your computer's command-line interface:
   - **Windows:** Press `Win + R`, type `cmd`, and press Enter (or search for "Command Prompt" in the Start Menu).
   - **macOS:** Press `Cmd + Space`, type `Terminal`, and press Enter.
   - **Linux:** Open your preferred terminal emulator.
2. Navigate to the extracted project folder using the `cd` command. For example:
   ```bash
   cd Desktop/TS-Workshop-Manager
   ```

---

### Step 3: Install Dependencies
Install all the required software packages (listed in `package.json`) by running:
```bash
npm install
```
*This may take a minute or two as it fetches and configures React, Vite, Express, Lucide icons, Tailwind, and other modules.*

---

### Step 4: Configure the Environment (Optional)
If you wish to use the server-side Gemini AI features (such as smart diagnosis and recommendations):
1. In the root directory of the folder, create a new file named `.env`.
2. Open the `.env` file in a text editor (like Notepad, TextEdit, or VS Code) and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *(You can obtain a free API key from Google AI Studio).*

---

### Step 5: Start the Software
To launch the development server, run:
```bash
npm run dev
```

You will see output indicating that the server is running successfully:
```text
Server running on http://localhost:3000
```

---

### Step 6: Open the Application
1. Open your web browser.
2. Navigate to:
   ```text
   http://localhost:3000
   ```
3. Enjoy using **TS Workshop Manager** locally on your laptop with full security clearance!

---

## 🛠️ Command Reference

| Command | Action |
| :--- | :--- |
| `npm install` | Installs all required project dependencies |
| `npm run dev` | Launches the local development server on port 3000 |
| `npm run build` | Compiles a production-ready build into the `dist/` folder |
| `npm run start` | Launches the compiled production server |
| `npm run lint` | Runs the TypeScript compiler check to verify type safety |
