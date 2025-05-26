import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4 md:px-8 lg:px-32">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="font-['Poppins'] font-semibold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          Blog & Guide
        </h1>
        <p class="font-['DM_Sans'] text-base md:text-lg max-w-4xl mx-auto opacity-80 leading-relaxed">
          Benvenuto nella sezione Blog & Guide di HeyHome, il tuo punto di riferimento per approfondimenti, consigli pratici e informazioni utili su edilizia, impiantistica, soluzioni energetiche e sostenibilità. Qui troverai contenuti pensati per aiutarti a scegliere i prodotti giusti, pianificare i tuoi progetti e capire meglio le tecnologie e le normative del settore.
        </p>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto">
        <!-- Category Filters -->
        <div class="flex flex-wrap justify-center gap-3 mb-16">
          <button class="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider">
            General
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            Regulations & Benefits
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            Technical Guides
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            Success Stories
          </button>
          <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider hover:bg-gray-200 transition-colors">
            FAQ & Video Tutorials
          </button>
        </div>

        <!-- Blog Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- Blog Post 1 -->
          <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div class="bg-gray-200 h-60 flex items-center justify-center">
              <span class="text-gray-500 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Apr 21, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>4 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Transforming an Office Building into a Sustainable Workplace
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Passo dopo passo, impara a installare pannelli solari, sostituire un pavimento o migliorare l'isolamento termico di casa tua. Le nostre guide sono scritte in modo chiaro e comprensibile, ideali sia per i professionisti che per chi è alle prime armi.
              </p>
            </div>
          </article>

          <!-- Blog Post 2 -->
          <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div class="bg-gradient-to-br from-blue-200 to-blue-300 h-60 flex items-center justify-center">
              <span class="text-blue-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Apr 21, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>4 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Renovation Success Stories: From Vision to Reality
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Passo dopo passo, impara a installare pannelli solari, sostituire un pavimento o migliorare l'isolamento termico di casa tua. Le nostre guide sono scritte in modo chiaro e comprensibile, ideali sia per i professionisti che per chi è alle prime armi.
              </p>
            </div>
          </article>

          <!-- Blog Post 3 -->
          <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div class="bg-gradient-to-br from-orange-200 to-orange-300 h-60 flex items-center justify-center">
              <span class="text-orange-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Apr 21, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>4 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Breaking Down Photovoltaic Systems: Myths vs. Facts
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Passo dopo passo, impara a installare pannelli solari, sostituire un pavimento o migliorare l'isolamento termico di casa tua. Le nostre guide sono scritte in modo chiaro e comprensibile, ideali sia per i professionisti che per chi è alle prime armi.
              </p>
            </div>
          </article>

          <!-- Blog Post 4 -->
          <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div class="bg-gradient-to-br from-blue-200 to-blue-300 h-60 flex items-center justify-center">
              <span class="text-blue-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Apr 21, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>4 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Renovation Success Stories: From Vision to Reality
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Passo dopo passo, impara a installare pannelli solari, sostituire un pavimento o migliorare l'isolamento termico di casa tua. Le nostre guide sono scritte in modo chiaro e comprensibile, ideali sia per i professionisti che per chi è alle prime armi.
              </p>
            </div>
          </article>

          <!-- Blog Post 5 -->
          <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div class="bg-gradient-to-br from-orange-200 to-orange-300 h-60 flex items-center justify-center">
              <span class="text-orange-700 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Apr 21, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>4 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Breaking Down Photovoltaic Systems: Myths vs. Facts
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Passo dopo passo, impara a installare pannelli solari, sostituire un pavimento o migliorare l'isolamento termico di casa tua. Le nostre guide sono scritte in modo chiaro e comprensibile, ideali sia per i professionisti che per chi è alle prime armi.
              </p>
            </div>
          </article>

          <!-- Blog Post 6 -->
          <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div class="bg-gray-200 h-60 flex items-center justify-center">
              <span class="text-gray-500 font-['DM_Sans']">Article Image</span>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>Apr 21, 2024</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>4 min</span>
                </div>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight">
                Transforming an Office Building into a Sustainable Workplace
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                Passo dopo passo, impara a installare pannelli solari, sostituire un pavimento o migliorare l'isolamento termico di casa tua. Le nostre guide sono scritte in modo chiaro e comprensibile, ideali sia per i professionisti che per chi è alle prime armi.
              </p>
            </div>
          </article>
        </div>

        <!-- See More Button -->
        <div class="text-center">
          <button class="inline-flex items-center gap-2 text-gray-800 font-['DM_Sans'] font-semibold text-lg hover:text-green-600 transition-colors">
            See more
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- What You'll Find Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              Cosa troverai in questa sezione?
            </h2>
            
            <div class="space-y-6">
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Guide Tecniche</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Passo dopo passo, impara a installare pannelli solari, sostituire un pavimento o migliorare l'isolamento termico di casa tua. Le nostre guide sono scritte in modo chiaro e comprensibile, ideali sia per i professionisti che per chi è alle prime armi.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Approfondimenti su Normative e Agevolazioni</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Rimani aggiornato sulle detrazioni fiscali, sulle normative ambientali e sugli incentivi per la riqualificazione energetica. Scopri come ottenere il massimo dalla tua ristrutturazione, risparmiando tempo, soldi ed energia.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Consigli per la Sostenibilità</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Consigli pratici per rendere la tua abitazione più efficiente e rispettosa dell'ambiente. Dall'uso di materiali riciclati alle tecnologie più innovative, troverai idee e ispirazioni per contribuire a un futuro più verde.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">Case Studies e Storie di Successo</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Dai uno sguardo a progetti realizzati con i nostri prodotti, scopri come altri clienti hanno trasformato i loro spazi, e lasciati ispirare da soluzioni che coniugano funzionalità, estetica ed efficienza energetica.
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">FAQ e Tutorial Video</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  Trova risposte rapide ai tuoi dubbi più comuni. Grazie ai video tutorial potrai comprendere meglio i passaggi chiave di una ristrutturazione o l'installazione di un impianto, imparando tecniche e buone pratiche direttamente dagli esperti.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Right Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              Il vostro partner di fiducia
            </h2>
            
            <p class="font-['DM_Sans'] text-base text-gray-800 leading-relaxed">
              Il nostro obiettivo è quello di fornirvi informazioni chiare, affidabili e aggiornate, aiutandovi a fare scelte consapevoli per migliorare la qualità e il comfort del vostro ambiente. Che stiate iniziando una piccola ristrutturazione o affrontando un progetto complesso, qui troverete tutto il supporto di cui avete bisogno, senza termini troppo tecnici o complicati.
              <br><br>
              Esplorate il blog e le guide di HeyHome, lasciatevi ispirare e contattateci se avete bisogno di ulteriori informazioni o di una consulenza personalizzata. Con noi, costruire e ristrutturare diventa più facile, sostenibile e conveniente.
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  `]
})
export class BlogComponent {
} 