// demo.js - Frontend logic for the Spam SMS Classifier demo.
// Uses a weighted heuristic scorer so the demo works instantly in the
// browser without a backend server.
// The full ML-trained model is in train_model.py + app.py.

const examples = [
  "WINNER!! As a valued network customer you have been selected to receive a £900 prize reward! To claim call 09061701461 now.",
  "Hey, are you free tomorrow evening? Let's catch up over coffee.",
  "URGENT! Your bank account has been suspended due to suspicious activity. Call 0800-000-0000 immediately to verify your details.",
];

function setExample(i) {
  document.getElementById("message").value = examples[i];
  analyze();
}

function clearIt() {
  document.getElementById("message").value = "";
  const result = document.getElementById("result");
  result.style.display = "none";
  result.className = "result";
}

// Enhanced classifier: weighted spam & ham patterns.
// Each pattern is [regex, weight]. No global regex flags to avoid
// lastIndex state issues.
var SPAM_PATTERNS = [
  [/winner|won|win\b/i, 3],
  [/prize|reward|lottery|jackpot/i, 3],
  [/congratulations|congrats/i, 2],
  [/claim\b/i, 2],
  [/free (entry|prize|trial|demo|gift)/i, 2],
  [/selected (to receive|as.*winner)/i, 3],
  [/£|₤|€|\$|cash|money/i, 2],
  [/urgent|immediately|act now/i, 2.5],
  [/suspended|deactivated|blocked|restricted/i, 2.5],
  [/account.*(suspended|verify|risk)|verify.*account/i, 3],
  [/\bbank\b|banking|financ/i, 2],
  [/call (now|immediately)|\bcall \d/i, 2.5],
  [/text (stop|now)|txt\b/i, 1.5],
  [/(http|www|\.com|\.net|\.org|\.link|\.xyz|\.top|information)/i, 3],
  [/click (here|now|the link)/i, 2.5],
  [/guaranteed|limited time|exclusive offer|complimentary/i, 2],
  [/password|pin|otp|credit card|debit card/i, 3],
  [/sms|mobile.*subscription|charged/i, 2],
  [/gift card|voucher|discount offer/i, 2],
  [/you have been selected|won a/i, 3],
  [/to stop|to opt.?out|reply stop/i, 1.5],
];

var HAM_PATTERNS = [
  [/hey\b|^hi\b|hello|good (morning|afternoon|evening)/i, 2],
  [/how are you|how are things/i, 1.5],
  [/are you (free|available|coming|going)/i, 2],
  [/\bcatch up|meet|coffee|lunch|dinner|tomorrow|tonight/i, 2],
  [/\bplease\b|\bthanks\b|thank you|\bok\b|\bsure\b|\bcool\b/i, 1.5],
  [/\b(see|talk|speak) (you|soon)\b/i, 1.5],
  [/did you|will you|can you|could you/i, 1.5],
  [/what.?s up|how.?s it going/i, 1.5],
];

// Count matches for a regex safely (no global flag needed).
function countMatches(text, re) {
  var m = text.match(re);
  return m ? m.length : 0;
}

function classify(msg) {
  var text = msg;
  var spamScore = 0;
  var hamScore = 0;
  var i;

  for (i = 0; i < SPAM_PATTERNS.length; i++) {
    var sp = SPAM_PATTERNS[i];
    var n = countMatches(text, sp[0]);
    if (n > 0) spamScore += sp[1] * Math.min(n, 2);
  }

  for (i = 0; i < HAM_PATTERNS.length; i++) {
    var hp = HAM_PATTERNS[i];
    if (hp[0].test(text)) hamScore += hp[1];
  }

  // Structural signals
  var exclamCount = countMatches(text, /!/);
  if (exclamCount >= 2) spamScore += 1.5;
  if (exclamCount >= 4) spamScore += 1;

  var upperCount = countMatches(text, /[A-Z]/);
  var totalLetters = countMatches(text, /[A-Za-z]/);
  if (totalLetters > 10 && upperCount / totalLetters > 0.5) spamScore += 2;

  var numCount = countMatches(text, /\d/);
  if (numCount >= 5) spamScore += 1.5;

  if (/\?/.test(text)) hamScore += 2;

  var wordCount = text.trim().split(/\s+/).length;
  if (wordCount <= 4 && numCount === 0) hamScore += 1.5;

  // Logistic squash to a probability
  var net = spamScore - hamScore;
  var spamProb = 1 / (1 + Math.exp(-net));
  spamProb = Math.min(0.99, Math.max(0.01, spamProb));

  var prediction = spamProb > 0.5 ? "SPAM" : "HAM";
  return { prediction: prediction, confidence: spamProb };
}

function analyze() {
  var msg = document.getElementById("message").value.trim();
  var result = document.getElementById("result");

  if (!msg) {
    result.style.display = "block";
    result.className = "result";
    result.innerHTML = "<strong>Please enter a message first.</strong>";
    return;
  }

  var res = classify(msg);
  var prediction = res.prediction;
  var confidence = res.confidence;

  result.style.display = "block";
  result.className = "result " + prediction.toLowerCase();

  var confidencePercent = Math.round(confidence * 100);
  result.innerHTML =
    "<strong>" + prediction + "</strong>" +
    '<div class="confidence">Confidence: ' + confidencePercent + "%</div>";
}
