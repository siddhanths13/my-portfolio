// Password Strength Checker - Demo heuristic classifier (no backend)
const COMMON = [
  "password", "123456", "12345678", "qwerty", "abc123", "password1",
  "123456789", "111111", "1234567", "iloveyou", "admin", "welcome",
  "monkey", "dragon", "letmein", "baseball", "sunshine", "princess"
];

function analyze() {
  const pw = document.getElementById("password").value;
  const result = document.getElementById("result");
  if (!pw) {
    result.className = "result";
    result.style.display = "block";
    result.textContent = "Please enter a password.";
    return;
  }

  const s = scorePassword(pw);
  let label, cls;
  if (s.score <= 2) {
    label = "WEAK";
    cls = "weak";
  } else if (s.score === 3) {
    label = "MEDIUM";
    cls = "medium";
  } else {
    label = "STRONG";
    cls = "strong";
  }

  result.className = "result " + cls;
  result.style.display = "block";
  result.innerHTML =
    "Strength: <strong>" + label + "</strong> (Score " + s.score + "/5)" +
    '<div class="score">' + s.reason + "</div>";
}

function scorePassword(pw) {
  let score = 0;
  const reasons = [];

  if (COMMON.includes(pw.toLowerCase())) {
    reasons.push("Common/known password");
  }
  if (pw.length < 8) {
    reasons.push("Too short (< 8 chars)");
  } else {
    score += 1;
    if (pw.length >= 12) score += 1;
  }
  if (/\d/.test(pw)) score += 1;
  else reasons.push("No digits");
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  else reasons.push("No mixed case");
  if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
  else reasons.push("No symbols");

  // Penalize sequential/repeated
  if (/(.)\1{2,}/.test(pw)) {
    score = Math.max(0, score - 1);
    reasons.push("Repeated characters");
  }
  if (/(abc|bcd|cde|123|234|345|qwe|wer)/.test(pw.toLowerCase())) {
    score = Math.max(0, score - 1);
    reasons.push("Sequential pattern");
  }

  score = Math.max(1, Math.min(5, score));
  const maxScore = passwordUpperBound(pw);
  const finalScore = Math.min(score, maxScore);
  return {
    score: finalScore,
    reason: reasons.length ? reasons.join(" • ") : "Good mix of characters",
  };
}

function passwordUpperBound(pw) {
  // Cap score based on length
  if (pw.length < 6) return 1;
  if (pw.length < 8) return 2;
  if (pw.length < 10) return 3;
  if (pw.length < 14) return 4;
  return 5;
}

function setExample(i) {
  const examples = ["123456", "password123", "Tr0ub4dor&3!x"];
  document.getElementById("password").value = examples[i];
  analyze();
}

function clearIt() {
  document.getElementById("password").value = "";
  document.getElementById("result").className = "result";
  document.getElementById("result").style.display = "none";
}
