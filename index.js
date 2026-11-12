// Infrastructure Decision Tool
// Part A: Subnet Host Checker
// Part B: Compute Environment Selector

const readlineSync = require("readline-sync");

// ===== SHARED INPUT HELPERS =====

// Keeps asking until the user types yes/y or no/n.
function askYesNo(prompt) {
  while (true) {
    const answer = readlineSync.question(prompt).trim().toLowerCase();
    if (answer === "yes" || answer === "y") return true;
    if (answer === "no" || answer === "n") return false;
    console.log("Please answer yes or no.");
  }
}

// ===== PART A: SUBNET HOST CHECKER =====

const AWS_RESERVED = 5; // AWS reserves 5 addresses in every subnet

// Accepts "/24" or "24". Must be between /16 and /30.
function askCidr(prompt) {
  while (true) {
    const input = readlineSync.question(prompt).trim();
    const match = input.match(/^\/?(\d{1,2})$/);
    if (match) {
      const prefix = Number(match[1]);
      if (prefix >= 16 && prefix <= 30) return prefix;
    }
    console.log("Invalid CIDR. Enter a prefix from /16 through /30 (example: /24).");
  }
}

// Must be a whole number of 1 or more.
function askPositiveInteger(prompt) {
  while (true) {
    const input = readlineSync.question(prompt).trim();
    if (/^\d+$/.test(input)) {
      const number = Number(input);
      if (Number.isSafeInteger(number) && number >= 1) return number;
    }
    console.log("Invalid input. Enter a positive whole number (1 or more).");
  }
}

function subnetHostChecker() {
  console.log("\n--- Subnet Host Checker ---");
  const vpcCidr = askCidr("VPC CIDR (example /16): ");
  const subnetCidr = askCidr("Subnet CIDR (example /24): ");
  const devices = askPositiveInteger("Number of devices required: ");

  console.log("\nResults");

  // 1. Is the subnet consistent with the VPC?
  // A bigger prefix number means a smaller network, so the subnet's
  // prefix number must be the same as or larger than the VPC's.
  if (subnetCidr >= vpcCidr) {
    console.log(`Consistent: a /${subnetCidr} subnet fits inside a /${vpcCidr} VPC.`);
  } else {
    console.log(`NOT consistent: a /${subnetCidr} subnet is larger than a /${vpcCidr} VPC, so it cannot fit inside it.`);
  }

  // 2. How many addresses can the subnet actually give to devices?
  const totalAddresses = Math.pow(2, 32 - subnetCidr);
  const usableAddresses = Math.max(0, totalAddresses - AWS_RESERVED);
  console.log(`Total addresses in /${subnetCidr}: ${totalAddresses}`);
  console.log(`Usable addresses (after AWS reserves ${AWS_RESERVED}): ${usableAddresses}`);

  // 3. Is that enough for the devices?
  if (usableAddresses >= devices) {
    console.log(`SUFFICIENT for ${devices} devices.`);
    console.log(`Unused IP addresses: ${usableAddresses - devices}`);
  } else {
    console.log(`NOT SUFFICIENT for ${devices} devices.`);
    console.log(`Additional IP addresses needed: ${devices - usableAddresses}`);
  }
}

// ===== PART B: COMPUTE ENVIRONMENT SELECTOR =====

// Application name cannot be blank.
function askNonEmpty(prompt) {
  while (true) {
    const input = readlineSync.question(prompt).trim();
    if (input !== "") return input;
    console.log("Invalid input. Please enter a value.");
  }
}

// Whole number, 0 or more.
function askWholeNumber(prompt) {
  while (true) {
    const input = readlineSync.question(prompt).trim();
    if (/^\d+$/.test(input)) {
      const number = Number(input);
      if (Number.isSafeInteger(number)) return number;
    }
    console.log("Invalid input. Enter a whole number (0 or more).");
  }
}

// Dollar amount, 0 or more. A "$" and commas are allowed (example: $1,500.50).
function askBudget(prompt) {
  while (true) {
    const input = readlineSync.question(prompt).trim().replace(/[$,]/g, "");
    if (/^(\d+\.?\d*|\.\d+)$/.test(input)) return Number(input);
    console.log("Invalid input. Enter a dollar amount of 0 or more (example: 1500).");
  }
}

function computeEnvironmentSelector() {
  console.log("\n--- Compute Environment Selector ---");
  const appName = askNonEmpty("Application name: ");
  const users = askWholeNumber("Monthly users: ");
  const budget = askBudget("Monthly budget in dollars: ");
  const highAvailability = askYesNo("High availability required? (yes/no): ");

  // Pick the architecture.
  let architecture;
  let usesAutoScaling = false;
  if (users > 10000 || highAvailability) {
    architecture = "EC2 + Load Balancer + Auto Scaling";
    usesAutoScaling = true;
  } else if (users >= 1000) {
    architecture = "EC2 + Load Balancer";
  } else {
    architecture = "Single EC2";
  }
  const needsMoreThanOneEc2 = architecture !== "Single EC2";

  console.log("\nRecommendation");
  console.log(`Application: ${appName}`);
  console.log(`Architecture: ${architecture}`);

  // Budget warnings.
  if (budget < 1000 && needsMoreThanOneEc2) {
    console.log("WARNING: Your budget is under $1,000, but this architecture needs more than a single EC2.");
  }
  if (budget >= 1000 && budget <= 3000 && usesAutoScaling) {
    console.log("WARNING: Your budget is $1,000-$3,000, but this architecture requires Auto Scaling.");
  }
}

// ===== MAIN PROGRAM =====

function main() {
  console.log("=== Infrastructure Decision Tool ===");

  let keepGoing = true;
  while (keepGoing) {
    console.log("\nWhich tool would you like to use?");
    console.log("1. Subnet Host Checker");
    console.log("2. Compute Environment Selector");
    const choice = readlineSync.question("Enter 1 or 2: ").trim();

    if (choice === "1") {
      subnetHostChecker();
    } else if (choice === "2") {
      computeEnvironmentSelector();
    } else {
      console.log("Invalid choice. Please enter 1 or 2.");
      continue;
    }

    keepGoing = askYesNo("\nWould you like to run another tool? (yes/no): ");
  }

  console.log("Goodbye!");
}

main();
