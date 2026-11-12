INFRASTRUCTURE DECISION TOOL
============================

A Node.js command-line program with two tools:
  1. Subnet Host Checker
  2. Compute Environment Selector

HOW TO RUN
----------
Requires Node.js and npm.
  1. Open a terminal in this folder.
  2. npm install
  3. npm start        (or: node index.js)

At startup the program asks which tool to use. After each run it asks
whether you want to run another tool or exit.


PART A: SUBNET HOST CHECKER
---------------------------
Inputs: VPC CIDR (such as /16), subnet CIDR (such as /24), and the
number of devices required.

Validation:
  - Both CIDRs must be between /16 and /30 (typing 24 or /24 both work).
  - Devices must be a positive whole number.

Output:
  - Whether the subnet CIDR is consistent with the VPC CIDR (the subnet
    prefix number must be the same as or larger than the VPC's).
  - Whether the subnet is sufficient for the devices.
  - The number of unused IPs, or the additional IPs needed.

AWS reserves 5 addresses in every subnet, so usable = total - 5.
(A /30 has only 4 addresses, so it has 0 usable.)

Example 1 - SUFFICIENT
  VPC CIDR: /16     Subnet CIDR: /24     Devices: 100
  A /24 has 256 addresses. Minus 5 reserved = 251 usable.
  Result: consistent, SUFFICIENT, 151 unused IP addresses.

Example 2 - NOT SUFFICIENT
  VPC CIDR: /16     Subnet CIDR: /28     Devices: 20
  A /28 has 16 addresses. Minus 5 reserved = 11 usable.
  Result: consistent, NOT SUFFICIENT, 9 additional IP addresses needed.


PART B: COMPUTE ENVIRONMENT SELECTOR
------------------------------------
Inputs: application name, monthly users, monthly budget, and whether
high availability (HA) is required (yes/no).

Recommendation:
  - Fewer than 1,000 users and no HA ... Single EC2
  - 1,000 to 10,000 users ............... EC2 + Load Balancer
  - More than 10,000 users OR HA ........ EC2 + Load Balancer + Auto Scaling

Budget warnings:
  - Under $1,000: warns if the architecture needs more than a single EC2.
  - $1,000 to $3,000: warns if the architecture requires Auto Scaling.

Example
  App: Shop     Users: 20000     Budget: 2000     HA: no
  Result: EC2 + Load Balancer + Auto Scaling, with a warning that the
  $1,000-$3,000 budget conflicts with Auto Scaling.
