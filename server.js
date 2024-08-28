const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve os arquivos estáticos na pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser para análise de dados de formulários
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// URL e chave do Supabase
const supabaseUrl = 'https://pwsqbotfircjyehciilb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3Fib3RmaXJjanllaGNpaWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2Mzc0MDIsImV4cCI6MjA0MDIxMzQwMn0.z92rihoDRW0kEzuE_7p69FgBm_oW4YGE-2fzUFLKPSI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Página inicial com detalhes do evento
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para processar o formulário de confirmação de presença
app.post('/api/submit', async (req, res) => {
    const { nome, presenca, comentarios, quantidade } = req.body;

    try {
        const { data, error } = await supabase
            .from('convite') // Certifique-se de que este é o nome correto da tabela
            .insert([{ nome, presenca, comentarios, quantidade }]);

        if (error) throw error;

        // Gerar PDF do convite
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, 'convites', `${nome}.pdf`);

        // Criar diretório "convites" caso não exista
        if (!fs.existsSync(path.join(__dirname, 'convites'))) {
            fs.mkdirSync(path.join(__dirname, 'convites'));
        }

        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(25).text('Convite para o Evento', {
            align: 'center'
        });

        doc.moveDown();
        doc.fontSize(18).text(`Nome: ${nome}`);
        // Adiciona o Código de Entrada
        doc.text('Código de Entrada: ' + Math.random().toString(36).substr(2, 8));

        doc.end();

        res.status(200).send(`Convite gerado com sucesso! Você pode baixá-lo <a href="/download/${nome}.pdf">aqui</a>.`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para download do PDF
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'convites', req.params.filename);
    res.download(filePath);
});

// Rota para exibir as confirmações na página de administração
app.get('/api/presencas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('convite')
            .select('*');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
