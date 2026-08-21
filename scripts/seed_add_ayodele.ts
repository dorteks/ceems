import "dotenv/config";
import { createUser } from "../server/services/userService";

// Seed script to add ayodele.superadmin with the default password.
// This file does not run automatically — run it locally when ready:
// npx ts-node --transpile-only scripts/seed_add_ayodele.ts

async function main() {
  const result = await createUser({
    name: "Ayodele Superadmin",
    username: "ayodele.superadmin",
    email: null,
    phone: null,
    role: "Super Administrator",
    hub: "All",
    // Use the same default password defined in the app
    password: "Ceems@2026",
    createdBy: null,
  });

  console.log("createUser result:", result);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default main;
