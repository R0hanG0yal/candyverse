# 📊 Google Sheets Live Sync — Setup Guide

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **CandyVerse Orders**
3. In the first sheet (Sheet1), add these headers in Row 1:

```
Order ID | Date | Customer | Phone | Address | Items | Subtotal | Delivery | Total | Payment Method | Payment Status | Order Status | Last Updated
```

---

## Step 2 — Create the Apps Script Webhook

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete everything and paste this code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    var data  = JSON.parse(e.postData.contents);

    // Check if order already exists (update row) or add new row
    var lastRow = sheet.getLastRow();
    var found   = -1;
    if (lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === data.orderId) { found = i + 2; break; }
      }
    }

    var row = [
      data.orderId,
      data.date,
      data.customerName,
      data.phone,
      data.address,
      data.items,
      data.subtotal,
      data.delivery,
      data.total,
      data.paymentMethod,
      data.paymentStatus,
      data.orderStatus,
      data.lastUpdated
    ];

    if (found > 0) {
      // Update existing row
      sheet.getRange(found, 1, 1, row.length).setValues([row]);
    } else {
      // Append new row
      sheet.appendRow(row);
    }

    // Color the Order Status cell based on status
    var statusCol = 12; // column L
    var targetRow = found > 0 ? found : sheet.getLastRow();
    var cell = sheet.getRange(targetRow, statusCol);
    var colors = {
      'Order Placed':     '#cce5ff',
      'Preparing':        '#fff3cd',
      'Packed':           '#e8d5ff',
      'Shipped':          '#d1ecf1',
      'Out for Delivery': '#ffd6e7',
      'Delivered':        '#d4edda'
    };
    cell.setBackground(colors[data.orderStatus] || '#ffffff');

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CandyVerse Sheets Webhook Active ✅' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Step 3 — Deploy as Web App

1. Click **Deploy → New Deployment**
2. Click the ⚙️ gear icon → **Web App**
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy** → **Authorize** → Copy the URL

---

## Step 4 — Connect to CandyVerse Admin

1. Open your CandyVerse site → go to `/admin-orders.html`
2. Paste the URL into the **Google Sheets — Live Sync** panel
3. Click **Save** then **Test**
4. Check your Google Sheet — a test row should appear! ✅

---

## How it works

- Every time you **update an order status** in the admin dashboard → auto-syncs to Sheets
- Every time a **new order is placed** → syncs on next admin open or "Sync All" click
- The **Order Status column** gets a color based on the step
- If the order already exists in the sheet, it **updates that row** (no duplicates)
- Click **📊 Export Excel** to download a full `.xlsx` file anytime

