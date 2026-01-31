import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';

const args = process.argv.slice(2);
const passwordArg = args.find((arg) => arg.startsWith('--password='));
const usernameArg = args.find((arg) => arg.startsWith('--username='));
const password = passwordArg?.split('=')[1];
const username = usernameArg?.split('=')[1];

if (!password || !username) {
  console.error(
    'Uso: ts-node src/scripts/reset-qa-password.ts --username=USUARIO_QA --password=NUEVO_PASSWORD',
  );
  console.error('Ejemplos:');
  console.error('  ts-node src/scripts/reset-qa-password.ts --username=user_qa --password=UserQA_123!');
  console.error('  ts-node src/scripts/reset-qa-password.ts --username=admin_qa --password=AdminQA_123!');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL no está configurado en el entorno.');
  process.exit(1);
}

const dataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User],
  synchronize: false,
});

const run = async (): Promise<void> => {
  await dataSource.initialize();
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await dataSource
    .createQueryBuilder()
    .update(User)
    .set({ passwordHash })
    .where('username = :username', { username })
    .andWhere('is_test_user = true')
    .execute();

  if (!result.affected) {
    console.log(
      `No se encontró un usuario QA con username=${username}. Verifica que exista y tenga is_test_user=true.`,
    );
  } else {
    console.log(`Password QA actualizado para username=${username}.`);
  }
  await dataSource.destroy();
};

run().catch((error) => {
  console.error('Error actualizando el password de QA:', error);
  dataSource.destroy().catch(() => undefined);
  process.exit(1);
});
