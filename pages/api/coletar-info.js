import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyDUaDSYUgWZiki1i1r1-gcDY-x1zEk1N7Q",
  authDomain: "bancoloc-94350.firebaseapp.com",
  projectId: "bancoloc-94350",
  storageBucket: "bancoloc-94350.firebasestorage.app",
  messagingSenderId: "1082372735782",
  appId: "1:1082372735782:web:d5c24c02e509a7000b37e7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const data = req.body;

  // Envia para o Firebase
  try {
    await push(ref(db, 'coletas'), data);
  } catch (err) {
    console.error('Erro ao salvar no Firebase:', err);
  }

  // Salva localmente no arquivo JSON
  const filePath = path.join(process.cwd(), 'data.json');
  let registros = [];

  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      registros = JSON.parse(fileData);
    }
  } catch (err) {
    console.error('Erro lendo o arquivo local:', err);
  }

  registros.push(data);

  try {
    fs.writeFileSync(filePath, JSON.stringify(registros, null, 2));
  } catch (err) {
    console.error('Erro salvando localmente:', err);
  }

  res.status(200).json({ status: 'Dados salvos com sucesso!' });
}
