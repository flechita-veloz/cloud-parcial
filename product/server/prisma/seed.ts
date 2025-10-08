import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  // Eliminar primero las tablas dependientes
  await prisma.transactions.deleteMany();
  await prisma.salesDetail.deleteMany();
  await prisma.billings.deleteMany();
  await prisma.sales.deleteMany();
  await prisma.loans.deleteMany();
  await prisma.purchases.deleteMany();
  await prisma.expenses.deleteMany();
  await prisma.documents.deleteMany(); // Relacionado con Clients

  // Luego eliminamos las tablas principales
  await prisma.products.deleteMany();
  await prisma.clients.deleteMany();
  await prisma.users.deleteMany();
 
  console.log("All data cleared in correct order");
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");
  //importa el orden al escribir las tablas .json ya que hay tablas que derivan de otros
  const orderedFileNames = [
    "products.json",
    "clients.json",
    "documents.json",
    "users.json",
    "sales.json",
    "loans.json",
    "purchases.json",
    "salesDetail.json",
    "billings.json",
    "expenses.json",
    "transactions.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }
    console.log("filename", fileName);
    for (const data of jsonData) {
      await model.create({
        data,
      });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
