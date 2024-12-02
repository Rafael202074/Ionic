import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import { AppComponent } from '../app.component';
import { ModalController } from '@ionic/angular';
import { ModalContentComponent } from '../modal-content/modal-content.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  transcricoes: any[] = []; 
  modalData = {
    transcricaoId: 0,
    comentario: '',
    estrelas: ''
  };

  text: string = '';
  translatedText: string = '';

  synth: any = window.speechSynthesis;
  utterance: any;
  isSpeaking: boolean = false;

  constructor(
    private http: HttpClient,
    private appComponent: AppComponent,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.getTranscriptionsFromDB();
  }

  ionViewWillEnter() {
    this.getTranscriptionsFromDB();
  }

  //LIGHT E DARK MODE
  toggle_lightDarkMode() {
    this.appComponent.toggle_lightDarkMode();
  }

  calcularDuracaoDia(data: string): string {
    const hoje = new Date();
    // Converter a data 'created_at' de string para um objeto Date
    const transcricaoDate = new Date(data.replace(' ', 'T')); // Ajuste necessário para garantir que o formato esteja correto

    const diffTime = hoje.getTime() - transcricaoDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); // Converte de milissegundos para dias

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays === 2) {
      return 'Anteontem';
    } else {
      return `${diffDays} dias atrás`;
    }
  }

  //RECUPERAR TRANSCRIÇÕES
  getTranscriptionsFromDB() {
      this.http.get('https://192.168.1.231:3000/getTranscricoes').subscribe(
          (response: any) => {
              for (let i = 0; i < response.length; i++) {
                response[i].duracaoDia = this.calcularDuracaoDia(response[i].created_at);
              }
              this.transcricoes = response;
              console.log('Transcrições recebidas:', response);
          },
          error => {
              console.error('Erro ao buscar transcrições:', error);
          }
      );
  }

  //RECUPERA INDEX
  getTranscricao(id: number) {
    for (let i = 0; i < this.transcricoes.length; i++) {
      if(this.transcricoes[i].id == id){
        this.text = this.transcricoes[i].texto;
        this.translatedText = this.transcricoes[i].textoTraduzido;
      }
    }
  }

  //FALAR TEXTO
  toggleText(id: number){
    this.getTranscricao(id);

    if (this.isSpeaking) {
      this.stopSpeakText();
    } else {
      this.speakText(this.text);
    }
  }
  speakText(text: string) {
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = 'pt-BR';
    this.synth.speak(this.utterance);
    this.isSpeaking = true;
  }
  stopSpeakText() {
    this.synth.cancel();
    this.isSpeaking = false;
  }

  //SALVAR EM PDF
  saveTextAsPDF(id: number) {
    this.getTranscricao(id);

    const doc = new jsPDF();
    const margins = { top: 10, left: 10, bottom: 10, right: 10 };  // Definindo as margens
  
    // Quebrando o texto para caber na página
    const lines = doc.splitTextToSize(this.text + '\n' + this.translatedText, 180);  // 180 é a largura da área da página

    // Adicionando o texto quebrado ao PDF
    doc.text(lines, margins.left, margins.top);  // Começa a escrever na posição (10, 10)
    
    // Gera o PDF como um Blob
    const pdfBlob = doc.output('blob');
    // Cria um URL para o Blob
    const url = URL.createObjectURL(pdfBlob);
    // Simula um clique para baixar o arquivo
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.pdf';
    a.click(); 
    
    URL.revokeObjectURL(url);  // Libera o URL após o download
  }

  //SALVAR FEEDBACK
  async openModal(id: number) {
    this.modalData.transcricaoId = id;
    
    const modal = await this.modalController.create({
      component: ModalContentComponent,
      componentProps: {
        modalData: this.modalData
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // Aqui você pode lidar com os dados após o fechamento do modal
      console.log('Dados do modal:', data);
    }
  }

}
