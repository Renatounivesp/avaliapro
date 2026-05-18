import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.company) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const companyId = user.company.id;

    // 1. Limpa estatísticas antigas para reescrever dados de simulação consistentes
    await db.analytics.deleteMany({
      where: { companyId },
    });

    const devices = ['MOBILE', 'DESKTOP', 'TABLET'];
    const ratings = ['EXCELENTE', 'BOA', 'RUIM', 'PESSIMA'];
    const analyticsToCreate = [];

    // 2. Cria dados simulados para os últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Quantidade randômica de visitas no dia (ex: entre 8 e 25)
      const dailyVisits = Math.floor(8 + Math.random() * 18);
      
      // Cliques randômicos (ex: entre 3 e as visitas diárias)
      const dailyClicks = Math.floor(3 + Math.random() * (dailyVisits - 5));

      // Gera Visitas
      for (let v = 0; v < dailyVisits; v++) {
        // Dispositivo randômico (peso maior para MOBILE)
        const randDevice = Math.random() < 0.7 ? 'MOBILE' : Math.random() < 0.9 ? 'DESKTOP' : 'TABLET';
        // Ajusta data para simular horários diferentes ao longo do dia
        const visitTime = new Date(date);
        visitTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        analyticsToCreate.push({
          companyId,
          type: 'VISIT',
          device: randDevice,
          createdAt: visitTime,
        });
      }

      // Gera Cliques
      for (let c = 0; c < dailyClicks; c++) {
        const randDevice = Math.random() < 0.7 ? 'MOBILE' : Math.random() < 0.9 ? 'DESKTOP' : 'TABLET';
        const randRating = Math.random() < 0.6 ? 'EXCELENTE' : 'BOA';
        const clickTime = new Date(date);
        clickTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        analyticsToCreate.push({
          companyId,
          type: 'CLICK',
          rating: randRating,
          device: randDevice,
          createdAt: clickTime,
        });
      }
    }

    // 3. Insere todos os registros no banco com uma transação em lote rápida
    await db.analytics.createMany({
      data: analyticsToCreate,
    });

    // 4. Também gera 3 feedbacks negativos fictícios para alimentar a tela de feedbacks de forma realista
    // Primeiro limpa os anteriores
    await db.feedback.deleteMany({ where: { companyId } });

    await db.feedback.createMany({
      data: [
        {
          companyId,
          customerName: 'Roberto Silva',
          customerEmail: 'roberto.silva@gmail.com',
          customerPhone: '(11) 98765-4321',
          rating: 'RUIM',
          comments: 'O pedido demorou mais de 45 minutos para chegar à mesa, e a batata frita veio fria. Espero melhorias no atendimento aos finais de semana.',
          status: 'PENDENTE',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        },
        {
          companyId,
          customerName: 'Mariana Costa',
          customerEmail: 'mari.costa@hotmail.com',
          customerPhone: '(21) 99123-5566',
          rating: 'PESSIMA',
          comments: 'O garçom foi extremamente ríspido quando pedi para alterar o acompanhamento do prato. Me senti desrespeitada. Ambiente bonito, mas atendimento fraco.',
          status: 'EM_CONTATO',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
        },
        {
          companyId,
          customerName: 'Carlos Eduardo',
          customerEmail: 'carlos.edu10@outlook.com',
          customerPhone: '(31) 97755-8822',
          rating: 'RUIM',
          comments: 'Música ao vivo estava absurdamente alta, não conseguíamos conversar na mesa. A comida estava boa, mas a poluição sonora estragou o jantar de aniversário.',
          status: 'RESOLVIDO',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao simular tráfego:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
