# Manual Card Search Feature

## ✅ Feature Added!

You now have **manual search** capability to bypass OCR when it's inaccurate!

---

## 🎯 How to Use Manual Search

### Option 1: From Main Screen
1. Open extension popup
2. Click **"Search Manually"** button
3. Enter card name (e.g., "Charizard VMAX")
4. Optionally enter set name or number
5. Click "Search Card" or press Enter

### Option 2: Skip OCR from Image Preview
1. Upload or capture an image
2. Instead of clicking "Analyze Card"
3. Click **"Search Manually Instead"**
4. Enter the card details you see in the image
5. Get accurate results!

### Option 3: Correct OCR Mistakes
1. OCR identifies wrong card
2. Click **"Wrong Card? Search Manually"**
3. Enter correct card name
4. Get the right card!

### Option 4: From Error Screen
1. OCR fails completely
2. Click **"Search Manually"**
3. Enter card details
4. Bypass OCR entirely!

---

## 📝 Input Fields

### Card Name (Required)
Examples:
- `Pikachu`
- `Charizard VMAX`
- `Mew XY192`
- `Umbreon VMAX`

### Set Name or Number (Optional)
You can enter either:

**Set Name:**
- `Vivid Voltage`
- `Sword & Shield`
- `Crown Zenith`

**Set Number:**
- `074/185`
- `025/073`
- `XY192`

---

## 🔍 How Search Works

### Exact Match First:
```
Input: "Charizard VMAX"
Search: name:"Charizard VMAX"
Result: Exact matches for Charizard VMAX
```

### With Set Filter:
```
Input: "Charizard VMAX" + "Darkness Ablaze"
Search: name:"Charizard VMAX" set.name:"Darkness Ablaze"
Result: Charizard VMAX from Darkness Ablaze specifically
```

### With Card Number:
```
Input: "Charizard" + "020/189"
Search: name:"Charizard" number:020/189"
Result: Exact card with that number
```

### Fuzzy Fallback:
```
Input: "Charizar" (typo)
Search: name:Charizar*
Result: Finds "Charizard" cards
```

---

## 💡 Tips for Best Results

### 1. **Use Official Card Names**
- ✅ `Pikachu VMAX`
- ❌ `Pikachu V-Max` (wrong format)

### 2. **Include Card Type Suffixes**
- ✅ `Charizard VMAX`
- ✅ `Mewtwo GX`
- ✅ `Lugia V`

### 3. **Check Set Names Carefully**
- ✅ `Vivid Voltage`
- ❌ `Vivid Voltages` (extra 's')

### 4. **Use Card Numbers When Possible**
- Most accurate: `Mew` + `XY192`
- Works great for promos and specific printings

### 5. **Try Different Variations**
If not found:
- Remove special characters
- Try without set name
- Check official Pokemon TCG database

---

## 🎨 User Interface

### Clean, Simple Form:
```
┌─────────────────────────────────┐
│   Manual Card Search            │
│   Enter card details to search  │
├─────────────────────────────────┤
│                                 │
│ CARD NAME *                     │
│ [e.g., Charizard VMAX        ] │
│                                 │
│ SET NAME OR NUMBER (OPTIONAL)   │
│ [e.g., Vivid Voltage or 074/185]│
│                                 │
│ [🔍 Search Card]               │
│ [  Back to Upload  ]            │
└─────────────────────────────────┘
```

### Features:
- Auto-focus on card name field
- Enter key support (no need to click)
- Loading indicator during search
- Clear error messages if not found

---

## 🔄 Complete Workflow Example

### Scenario: OCR Misidentified Card

1. **Capture image** of Mew XY192 card
2. Click **"Analyze Card"**
3. OCR shows: "Unknown Card" or wrong card
4. Click **"Wrong Card? Search Manually"**
5. Enter:
   - Card Name: `Mew`
   - Set/Number: `XY192`
6. Press **Enter** or click **"Search Card"**
7. ✅ **Correct card appears** with pricing!

### Scenario: Direct Manual Search

1. Open extension
2. Click **"Search Manually"**
3. Enter:
   - Card Name: `Umbreon VMAX`
   - Set Name: `Evolving Skies`
4. Press **Enter**
5. ✅ **Card found** with market price!

---

## ⚙️ Technical Details

### API Queries:
- Exact name matching with quotes
- Set filtering by name or number
- Fuzzy matching for typos
- Best match algorithm

### Prioritization:
1. Cards with TCGPlayer pricing (most useful)
2. Exact name matches
3. Fuzzy matches sorted by relevance

### Error Handling:
- Helpful error messages
- Suggestions for corrections
- Fallback to fuzzy search

---

## 🎯 When to Use Manual Search

### Use Manual Search When:
- ✅ OCR identifies wrong card
- ✅ Image quality is poor
- ✅ You know exact card name
- ✅ Card has special characters OCR misses
- ✅ Faster than uploading image
- ✅ You have card code/number

### Use OCR When:
- ✅ Good quality image
- ✅ Don't know exact card name
- ✅ Want to quickly scan cards

---

## 📊 Advantages of Manual Search

| Feature | Benefit |
|---------|---------|
| **100% Accurate** | No OCR errors |
| **Fast** | Direct database search |
| **Flexible** | Works with partial info |
| **Set Specific** | Find exact printing |
| **Typo Tolerant** | Fuzzy matching helps |
| **Always Available** | No image needed |

---

## 🚀 Quick Start

**Just 3 steps:**

1. Click **"Search Manually"**
2. Type card name: `Charizard VMAX`
3. Press **Enter**

Done! 🎉

---

## 💬 Example Searches

### Simple Search:
```
Card Name: Pikachu
Set/Number: (leave empty)
→ Shows all Pikachu cards with pricing
```

### Specific Set:
```
Card Name: Charizard VMAX
Set/Number: Darkness Ablaze
→ Shows Charizard VMAX from that set
```

### By Card Number:
```
Card Name: Mew
Set/Number: XY192
→ Exact promo card
```

### With Typo (Fuzzy):
```
Card Name: Pikach
Set/Number: (empty)
→ Still finds "Pikachu" cards
```

---

## 🎨 Visual Indicators

- **Purple search icon** = manual search mode
- **Blue primary button** = ready to search
- **Spinning loader** = searching...
- **Green result** = card found!
- **Red error** = try different search

---

## ⌨️ Keyboard Shortcuts

- **Enter** in card name field = Search
- **Enter** in set field = Search
- **Tab** = Move between fields

---

## 🔧 Troubleshooting

### "Card not found"
- Check spelling
- Try without set name
- Remove special characters
- Try first word only (e.g., "Charizard")

### Wrong card appears
- Add set name for specificity
- Use card number if known
- Try full exact name with spaces

### Multiple results
- First card with pricing shown
- Add set name to narrow down
- Use card number for exact match

---

## ✨ Summary

Manual search gives you **full control** when OCR doesn't work perfectly. You can now:

✅ Enter card names directly
✅ Filter by set or number
✅ Correct OCR mistakes
✅ Search without an image
✅ Get accurate results every time

**Perfect complement to OCR scanning!** 🎯
