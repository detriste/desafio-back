const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'felipegoku1a@gmail.com',
    pass: 'fldnusfhpqlkkonl',
  },
});

exports.enviarEmailManutencao = async (ferramentaNome, ferramenta_codigo, descricaoProblema, almoxarifaNome) => {
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const mailOptions = {
    from: '"Sistema de Ferramentas" <detriste2018@gmail.com>',
    to: 'detriste2018@gmail.com',
    subject: `🔧 Ferramenta enviada para manutenção: ${ferramentaNome}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #e65100; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">⚠️ Ferramenta em Manutenção</h2>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px;">Uma ferramenta foi enviada para manutenção. Veja os detalhes abaixo:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Ferramenta</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${ferramentaNome}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Código</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${ferramenta_codigo ?? '—'}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Registrado por</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${almoxarifaNome ?? 'Almoxarife'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Data/Hora</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${agora}</td>
            </tr>
            <tr style="background-color: #fff3e0;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Descrição do Problema</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #bf360c;"><strong>${descricaoProblema}</strong></td>
            </tr>
          </table>
        </div>
        <div style="background-color: #f5f5f5; padding: 14px; text-align: center; font-size: 12px; color: #888;">
          Mensagem automática — Sistema de Controle de Ferramentas
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};