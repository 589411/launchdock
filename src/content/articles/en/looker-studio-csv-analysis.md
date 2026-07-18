---
title: "Analyze a CSV in Looker Studio: From Connector to Data Source"
description: "Google's free Looker Studio (formerly Data Studio) can turn a CSV file straight into an interactive dashboard. This walks you through the crucial first step: pick the 'Upload CSV' connector, authorize Google Cloud Storage, create a dataset, upload the file, and confirm the field schema — laying the groundwork before you build any charts."
contentType: "tutorial"
scene: "advanced"
difficulty: "intermediate"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 8
tags: ["Looker Studio", "Google", "Data Analysis", "Setup"]
stuckOptions:
  "Can't find the Upload CSV option": ["Too many connectors to find it", "Why authorize Google Cloud Storage?", "Is there a CSV size limit?"]
  "Fields look wrong after upload": ["Numbers treated as text", "Dates not recognized", "A column is entirely blank"]
  "How do I build charts next": ["What happens after I click Connect?", "Data source vs. report?", "Can I re-upload different data?"]
---

> **In one line**: In [Looker Studio](https://lookerstudio.google.com), click Create → Data source, pick the "Upload CSV" connector, authorize Google Cloud Storage once, create a dataset, drop your CSV in, confirm the schema, and click Connect — your CSV becomes a chart-ready data source.

**Keywords**: Looker Studio, Data Studio, upload CSV, connector, data source, dataset, Google Cloud Storage, field schema

---

## What is Looker Studio, and why use it for CSVs?

**Looker Studio** is Google's free data-visualization tool (it has a bit of a naming identity crisis: it used to be Data Studio, and the interface now also labels it "數據分析" in Chinese — same product). You connect data, build interactive charts and dashboards by dragging fields around, and share them.

It connects to many sources (Google Sheets, BigQuery, Google Analytics…), but the simplest and most beginner-friendly is to **upload a CSV file directly**. Got an Excel/CSV and want to spot trends fast? This is the shortest path.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: If Excel is you chopping vegetables in your own kitchen, Looker Studio is the plating step that presents the dish nicely to guests. Same data — Excel is for your own calculations, Looker Studio is for a dashboard others grasp at a glance.

This example uploads a café sales CSV (`dirty_cafe_sales.csv`) and covers the "turn a CSV into a data source" leg. Building charts is the next article, but the foundation is right here.

---

## Step 1: Open the Looker Studio home

Open [lookerstudio.google.com](https://lookerstudio.google.com) and sign in with your Google account. On the home page, the left nav shows **Create, Recent, Shared with me, Owned by me, Templates**…; the middle has three "get started" cards: **Create a report / Analyze with conversation / Learn Looker Studio**, with your recent reports and data sources listed below.

![The Looker Studio home page, left nav and recent items](/images/articles/looker-studio-csv-analysis/looker-home.png)

---

## Step 2: Create a new data source

Click the **Create** button top-left; the menu expands into **Report / Conversation / Data source / Explorer**. We want **Data source**.

![The Create menu expanded, choosing Data source](/images/articles/looker-studio-csv-analysis/looker-connectors.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: A **data source** is the ingredients; a **report** is the finished dish. You prep the ingredients (data) before you can cook (build charts). This article focuses on prepping.

On the "Untitled Data Source" page you'll see a row of **Google Connectors**: Looker, Google Analytics, Google Ads, Google Sheets, BigQuery, AppSheet, Microsoft Excel… each is one way to bring data in.

---

## Step 3: Pick the "Upload CSV" connector

Find **"Upload CSV file"** in the connector list (developer: Google, described as "Connect to a CSV (comma-separated values) file"). Click it.

![The "Upload CSV file" connector in the list](/images/articles/looker-studio-csv-analysis/looker-csv-connector.png)

### 🚨 Too many connectors — can't find Upload CSV?

The list shows Google's popular connectors first (BigQuery, Analytics…). The CSV tile sits further down; the fastest way is to type "CSV" in the search box at the top, or scroll down a bit.

---

## Step 4: Authorize Google Cloud Storage (just once)

The first time you use the CSV connector, Looker Studio tells you: **"Looker Studio needs to upload your data to Google Cloud Storage. Please authorize."** and asks you to click **Authorize**.

That's because your CSV is actually stored in Google's cloud storage (every account gets 2 GB free). After you authorize, a Google account chooser pops up — pick your account and consent. **You only do this authorization once**; future CSV uploads won't ask again.

![The CSV connector authorization screen, asking to authorize Google Cloud Storage](/images/articles/looker-studio-csv-analysis/looker-authorize-gcs.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: This step is like putting luggage in a locker — Looker Studio needs somewhere to keep your CSV, and that place is Google Cloud Storage. Authorizing hands it a locker key, and it stores things for you from then on.

---

## Step 5: Create a dataset and upload the CSV

After authorizing, you get a three-column workspace: **Datasets / Files / Schema**.

1. In the left **Datasets** column, click **"+ Create dataset"**, name this batch (the example uses `cafe`), and click **Continue**.

   ![Creating a dataset named cafe](/images/articles/looker-studio-csv-analysis/looker-create-dataset.png)

2. Then in the middle **Files** column, click **"+ Add file"** or drag the CSV in. Max 100 MB per dataset.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **In other words**: A **dataset** is a folder; a **file** is the CSV inside it. One dataset can hold multiple CSVs with the same structure, and they merge automatically — like stacking several months of sales reports to view together.

---

## Step 6: Confirm the schema and click Connect

After the file uploads, the right **Schema** column lists the fields Looker Studio auto-detected. For the example café sales data, it found: Transaction ID, Item, Quantity, Price Per Unit, Total Spent, Payment Method, Location, Transaction Date.

Once the fields look right, click **Connect** top-right, and the CSV officially becomes a data source you can build reports on.

![Upload complete, the auto-detected field schema on the right](/images/articles/looker-studio-csv-analysis/looker-schema-preview.png)

### 🚨 Numbers treated as text, dates not recognized?

CSVs carry no type information, so Looker Studio guesses. If an amount column is read as "text" or a date isn't recognized as a "date," **don't rush into charts** — in the data source's field list, manually change that field's type to Number or Date. The sample file being named `dirty_cafe_sales` is a hint: real-world data often needs cleaning and type-fixing before the charts will render.

---

## Done! What's next?

You've now turned a CSV into a Looker Studio **data source**. Next:

1. Go to **Create → Report** and pick this data source.
2. Drop in a table or bar chart and drag fields (e.g., Item, Total Spent) onto it.
3. Looker Studio computes live — which item sells best, which location earns most, at a glance.

The data source is the foundation; the report is the building. With the foundation set, building goes fast.

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **One last nudge from the Duck**: Lots of people get stuck on "my data won't upload," and nine times out of ten it's the Step 4 Google Cloud Storage authorization that wasn't clicked, or a CSV encoding/field issue. Remember the path: Create → Data source → Upload CSV → Authorize → Create dataset → Upload → Connect. Walk it once and it becomes muscle memory.
