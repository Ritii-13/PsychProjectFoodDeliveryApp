# Food Delivery Study - User Manual

## Welcome!

This application is designed to help us understand how people perceive delivery times and ratings. Your participation is valuable, and this manual will guide you through the entire process step by step.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Home Page - Participant Login](#home-page---participant-login)
3. [Menu Selection](#menu-selection)
4. [Placing Your Order](#placing-your-order)
5. [Tracking Your Delivery](#tracking-your-delivery)
6. [Rating Your Experience](#rating-your-experience)
7. [Understanding the Interface](#understanding-the-interface)
8. [Tips & Common Questions](#tips--common-questions)

---

## Getting Started

**What You'll Need:**
- A web browser (Chrome, Firefox, Safari, or Edge)
- A stable internet connection

**How to Start:**
1. Run `npm dev install` for the root directory
1. Open your web browser
2. Go to: `http://localhost:3000`
3. You'll see the home page with pre-filled participant information

---

## Home Page - Participant Login

### What You See:

**Participant ID:** This is your unique identifier (e.g., "P-001")
- You can change this if needed, but keep it consistent

**Experiment ID:** This helps us track which experiment number this is for you (e.g., "EXP-001")
- This will automatically suggest the next available number
- The system remembers your previous experiments to avoid duplicates

### What to Do:

1. **Check the IDs** - The system will pre-fill these values for you
2. **Review them** - Make sure they look correct
3. **Click "Continue ->"** - to proceed to the menu

> **Tip:** If you need to change these values, you can edit them directly in the text boxes. Just click on the field and type your desired ID.

---

## Menu Selection

### What You're Choosing:

This page shows a list of restaurants with different food categories:

- **Restaurant Name** - The name of the establishment
- **Menu Items** - Types of food available (burgers, pizzas, chinese food, etc.)
- **Photos** - Visual previews of the meals

### How to Order:

1. **Browse the restaurants** - Scroll through the available options
2. **Click on a restaurant** - This shows you their menu items
3. **Select items** - Click on any food item you want to add to your order
4. **Add to Cart** - Each item has an "Add to Cart" button
5. **View Your Cart** - See the green cart button at the bottom showing how many items you've selected
6. **Click "Proceed to Checkout"** - When you're ready to order

> **Note:** You only need 1-3 items in your cart. This is just a simulation, so choose what sounds good to you!

---

## Placing Your Order

### Your Order Summary:

This page shows:
- **Items in your cart** - Everything you selected
- **Restaurant name** - Where your order is from
- **Your IDs** - Participant and Experiment IDs

### What Happens Next:

1. **Review your order** - Make sure everything looks correct
2. **Click "Place Order"** - This submits your order
3. **System responds** - You'll see "Order Confirmed!" message

**You're now in the delivery tracking phase!** 

---

## Tracking Your Delivery

### Important Elements:

#### 1. **Status Badge** (Top left green box)
- Shows three possible statuses:
  - 🟢 **"ON TIME"** - Order is arriving as expected
  - 🟡 **"EARLY"** - Order is arriving faster than expected
  - 🔴 **"DELAYED"** - Order is arriving slower than expected

#### 2. **Status Title & Message**
- **Title:** Main status (e.g., "Picking your order now")
- **Message:** Details about what's happening
  - "Delivery partner is at the restaurant"
  - "Your order is out for delivery"
  - "Order is being prepared"

#### 3. **Timer Badge** (Green circle on the right)
- Shows remaining minutes until delivery
- Counts down: 16 → 15 → 14... → 0

#### 4. **System Clock** (Bottom of card)
- Shows the current time (HH:MM format)
- Helps you track how much real time has passed
- Updates every second

#### 5. **Order Timeline** (Optional)
- Tracks major milestones in your order
- Shows when order was placed, sent out, etc.

#### 6. **Proceed to Rating Button** (Bottom)
- **Appears automatically** when your order arrives (timer reaches 0)
- Click when ready to rate your experience

### What to Do:

1. **Watch the timer** - See how long until your order arrives
2. **Read the messages** - Get updates on order status
3. **Wait patiently** - The delivery will complete automatically
4. **Don't close the page** - Keep it open for the full experience
5. **Watch for the button** - When the "Proceed to Rating" button appears, your order has arrived!

> **Typical delivery time:** 2-5 minutes of tracking (this is accelerated for the study)

---

## Rating Your Experience

### The Rating Page:

After your order arrives, you'll see a rating form with the following:

#### **Participant Info** (Top)
- Confirms your Participant ID and Experiment ID
- Your order details

#### **Five-Star Rating System**
You'll rate your delivery experience with **1 to 5 stars**:

- ⭐ **1 Star** - Very Poor / Very Weak
- ⭐⭐ **2 Stars** - Poor / Weak
- ⭐⭐⭐ **3 Stars** - Average / Neutral
- ⭐⭐⭐⭐ **4 Stars** - Good / Strong
- ⭐⭐⭐⭐⭐ **5 Stars** - Excellent / Very Strong

### How to Rate:

1. **Think about your experience** - How was the delivery time? (early, on-time, or delayed?)
2. **Hover over the stars** - They'll highlight as you move your cursor
3. **Click your rating** - Select 1-5 stars for how you feel
4. **Stars turn yellow** - When selected, stars become yellow to show your choice
5. **Click "SUBMIT RATING"** - Confirms your response

### What Happens After:

- You'll see a **"Rating Submitted"** confirmation message
- Your rating is saved to our database
- You can choose to:
  - **"Home"** - Return to the beginning and start a new experiment

---

## Tips & Common Questions

### **Q: Can I change my Participant or Experiment ID?**
**A:** Yes! Click on the text field and type your preferred ID on the home page.

### **Q: What if I accidentally close the page?**
**A:** The system has saved your order. You can go back to the tracking page and it will resume from where it left off.

### **Q: Why does the timer sometimes seem to jump?**
**A:** The timer updates every 5 seconds to mimic a real delivery app. The behind-the-scenes countdown happens every second, so this is normal!

### **Q: Does the delivery time mean anything?**
**A:** The delivery time varies deliberately - sometimes early, sometimes on-time, sometimes delayed. This is part of the study to understand how you perceive time differences.

### **Q: Can I rate the same experiment twice?**
**A:** No - once you submit a rating, that experiment is complete. Start a new experiment if you want to rate again.

### **Q: What's the difference between the system clock and the timer?**
**A:** 
- **System Clock** - Shows real time (like a watch on the wall)
- **Timer** - Shows estimated minutes remaining until delivery

### **Q: Is my data private?**
**A:** Yes! Your Participant ID is used to organize your data, but all responses are confidential and used only for research purposes.

---

## Quick Reference Guide

### Step-by-Step Summary:

1. **Enter** → Home page with your IDs
2. **Choose** → Pick a restaurant and items
3. **Checkout** → Review your cart
4. **Order** → Place your order
5. **Track** → Watch delivery progress
6. **Rate** → Give your experience rating
7. **Done!** → Option to start a new experiment

---

## Need Help?

If you experience any issues:

1. **Page not loading?** - Try refreshing your browser (press F5)
2. **Button not working?** - Make sure you filled in all required fields
3. **Order stuck?** - Wait 30 seconds, then refresh the page
4. **Other issues?** - Note the problem and inform the study coordinator

---

## Thank You!

Your participation in this study is greatly appreciated. Your experience ratings and behavioral data help us understand how people perceive delivery times and service quality. 

**Happy ordering!**

---

**Last Updated:** March 2026  
**Version:** 1.0
