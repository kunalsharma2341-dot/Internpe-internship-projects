const resultDisplay = document.querySelector("#result");
const calculationDisplay = document.querySelector("#calculation");
const keypad = document.querySelector(".keypad");

const MAX_INPUT_LENGTH = 14;
const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷"
};

let currentInput = "0";
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let calculationText = "Ready";

function formatForDisplay(value) {
  if (value === "Error") return value;
  if (value.toLowerCase().includes("e")) return value;

  const [integerPart, decimalPart] = value.split(".");
  const formattedInteger = Number(integerPart).toLocaleString("en-US");
  return decimalPart === undefined
    ? formattedInteger
    : `${formattedInteger}.${decimalPart}`;
}

function updateDisplay() {
  resultDisplay.textContent = formatForDisplay(currentInput);
  calculationDisplay.textContent = calculationText;
}

function resetAfterError() {
  if (currentInput !== "Error") return;
  currentInput = "0";
  calculationText = "Ready";
}

function inputNumber(value) {
  resetAfterError();

  if (value === ".") {
    inputDecimal();
    return;
  }

  if (waitingForSecondOperand) {
    currentInput = value;
    waitingForSecondOperand = false;
    return;
  }

  const digitCount = currentInput.replace(/[-.]/g, "").length;
  if (digitCount >= MAX_INPUT_LENGTH) return;

  currentInput = currentInput === "0" ? value : currentInput + value;
}

function inputDecimal() {
  resetAfterError();

  if (waitingForSecondOperand) {
    currentInput = "0.";
    waitingForSecondOperand = false;
    return;
  }

  if (!currentInput.includes(".")) currentInput += ".";
}

function calculate(left, right, selectedOperator) {
  let answer;

  switch (selectedOperator) {
    case "+":
      answer = left + right;
      break;
    case "-":
      answer = left - right;
      break;
    case "*":
      answer = left * right;
      break;
    case "/":
      if (right === 0) return null;
      answer = left / right;
      break;
    default:
      return right;
  }

  if (!Number.isFinite(answer)) return null;
  return Number.parseFloat(answer.toPrecision(12));
}

function showError(message) {
  currentInput = "Error";
  calculationText = message;
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = true;
}

function chooseOperation(nextOperator) {
  resetAfterError();
  const inputValue = Number.parseFloat(currentInput);

  if (operator && waitingForSecondOperand) {
    operator = nextOperator;
    calculationText = `${formatForDisplay(String(firstOperand))} ${operatorSymbols[operator]}`;
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    const answer = calculate(firstOperand, inputValue, operator);
    if (answer === null) {
      showError("Cannot divide by zero");
      return;
    }
    currentInput = String(answer);
    firstOperand = answer;
  }

  operator = nextOperator;
  waitingForSecondOperand = true;
  calculationText = `${formatForDisplay(String(firstOperand))} ${operatorSymbols[operator]}`;
}

function showResult() {
  if (!operator || waitingForSecondOperand || currentInput === "Error") return;

  const secondOperand = Number.parseFloat(currentInput);
  const expression = `${formatForDisplay(String(firstOperand))} ${operatorSymbols[operator]} ${formatForDisplay(String(secondOperand))} =`;
  const answer = calculate(firstOperand, secondOperand, operator);

  if (answer === null) {
    showError("Cannot divide by zero");
    return;
  }

  currentInput = String(answer);
  calculationText = expression;
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = true;
}

function clearCalculator() {
  currentInput = "0";
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  calculationText = "Ready";
}

function deleteLastCharacter() {
  if (waitingForSecondOperand || currentInput === "Error") return;
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  if (currentInput === "-") currentInput = "0";
}

function applyPercentage() {
  if (currentInput === "Error") return;
  const originalValue = Number.parseFloat(currentInput);
  currentInput = String(originalValue / 100);
  waitingForSecondOperand = false;
  calculationText = `${formatForDisplay(String(originalValue))}% =`;
}

function toggleSign() {
  if (currentInput === "0" || currentInput === "Error") return;
  currentInput = currentInput.startsWith("-")
    ? currentInput.slice(1)
    : `-${currentInput}`;
}

function handleAction(action) {
  switch (action) {
    case "clear":
      clearCalculator();
      break;
    case "delete":
      deleteLastCharacter();
      break;
    case "percent":
      applyPercentage();
      break;
    case "sign":
      toggleSign();
      break;
    case "calculate":
      showResult();
      break;
  }
}

function processButton(button) {
  if (button.dataset.number !== undefined) {
    inputNumber(button.dataset.number);
  } else if (button.dataset.operation) {
    chooseOperation(button.dataset.operation);
  } else if (button.dataset.action) {
    handleAction(button.dataset.action);
  }

  updateDisplay();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  processButton(button);
});

document.addEventListener("keydown", (event) => {
  let button;

  if (/^[0-9.]$/.test(event.key)) {
    button = document.querySelector(`[data-number="${event.key}"]`);
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    button = document.querySelector(`[data-operation="${event.key}"]`);
  } else if (event.key === "Enter" || event.key === "=") {
    button = document.querySelector('[data-action="calculate"]');
  } else if (event.key === "Backspace") {
    button = document.querySelector('[data-action="delete"]');
  } else if (event.key === "Escape" || event.key === "Delete") {
    button = document.querySelector('[data-action="clear"]');
  } else if (event.key === "%") {
    button = document.querySelector('[data-action="percent"]');
  }

  if (!button) return;
  event.preventDefault();
  processButton(button);
  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 120);
});

updateDisplay();
