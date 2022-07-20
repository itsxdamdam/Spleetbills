const express = require("express");
const app = express()
// const compute = require('./evaluate')

app.use(express.json())
app.use(express.urlencoded({extended: false }))


app.get('/', (req, res) => {
  res.status(201).send('Welcome')
})

app.post('/split-payments/compute', (req, res) => {
  const {
    ID,
    Amount,
    currency,
    CustomerEmail,
    SplitInfo: [
      {
      SplitType,
      SplitValue,
      SplitEntityId
      }
    ]
  } = req.body;

  const body = req.body;

  let Balance = body.Amount;

  let SplitBreakDown = [];

  const flat = body.SplitInfo.filter(SplitInfo => SplitInfo.SplitType === "FLAT");
  const percentage = body.SplitInfo.filter(SplitInfo => SplitInfo.SplitType === "PERCENTAGE");
  const ratio = body.SplitInfo.filter(SplitInfo => SplitInfo.SplitType === "RATIO")

  function flatEvaluation() {
    for (let i = 0; i < flat.length; i++) {
      SplitBreakDown.push({
        "SplitBreakDown": flat[i].SplitEntityId,
        "Amount":flat[i].SplitValue
      })
      Balance -= flat[i].SplitValue
    }
    return Balance
  }

  flatEvaluation()

  function percentageValue() {
    for (let i = 0; i < percentage.length; i++) {
      const percentageValue = percentage[i].SplitValue
      const evaluatedValue = (percentageValue/100) * Balance
      SplitBreakDown.push({
        "SplitBreakDown": percentage[i].SplitEntityId,
        "Amount": evaluatedValue
      })
      Balance -= evaluatedValue;
    }
    return Balance
  }

  percentageValue()

  function ratioValue(totalRatio, value) {
    totalRatio = 0
    for (let i = 0; i < ratio.length; i++) {
      value = ratio[i].SplitValue;
      totalRatio += value
    }

    const openingRatioBalance = Balance;

    for (let x = 0; x < ratio.length; x++) {
      const values = ratio[x].SplitValue;
      const evaluateRatio = (values/totalRatio) * openingRatioBalance
      Balance -= evaluateRatio
      console.log(Balance);
      SplitBreakDown.push({
        "SplitBreakDown": ratio[x].SplitEntityId,
        "Amount": evaluateRatio
      })
    }
    
    return Balance
  }

  ratioValue();

  const result = {
    ID,
    Balance,
    SplitBreakDown
  }

  console.log(result);

  if (!body) {
    return res
    .status(400)
    .json('Please provide data')
  }

  res.status(200).json({result})
})


app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port 3000...");
})