import { Component, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { jsPDF } from 'jspdf';
import { dicionarioPTEN, dicionarioPTES, dicionarioPTFR, dicionarioENES } from '../services/dicionario';
import { AppComponent } from '../app.component';

interface TranscricaoResponse {
  insertId: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  isRecording: boolean = false;
  transcricaoId: number = 0;
  text: string = 'Fale Algo 😴';
  translatedText: string = '';
  recognition: any;
  linguagemPadrao1: string = 'português';
  linguagemPadrao2: string = 'inglês';
  duration: any;
  startRecordingDate: any;
  animationFrameId: number = 0;
  isDeleteDisabled: boolean = true;

  dicionarioPTEN = dicionarioPTEN;
  dicionarioPTES = dicionarioPTES;
  dicionarioPTFR = dicionarioPTFR;

  synth: any = window.speechSynthesis;
  utterance: any;
  isSpeaking: boolean = false;

  constructor(
    private ngZone: NgZone, 
    private http: HttpClient,
    private alertController: AlertController,
    private appComponent: AppComponent
  ) {}

  //LIGHT E DARK MODE
  toggle_lightDarkMode() {
    this.appComponent.toggle_lightDarkMode();
  }

  //INICIAR RECONHECIMENTO
  startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.startRecordingDate = Date.now();

    this.recognition.onstart = () => {
      console.log('Voice recognition started. Speak into the microphone.');
      this.drawWaveform();
      this.isRecording = true;
    };

    this.recognition.onspeechend = () => {
      console.log('Speech recognition has stopped.');
    };

    this.recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      this.ngZone.run(() => {
        if(this.text == 'Fale Algo 😴'){
          this.text = '';
        }
        if(this.text == 'parar gravação'){
          this.stopListening();
        }
        this.text += speechResult + ' ';
        this.translatedText = this.translate(this.text);
        console.log('Result: ', speechResult);
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error(event.error);
    };

    this.recognition.onend = () => {
      if (this.recognition.state !== 'recording' && this.isRecording) {
        this.recognition.start(); // Reinicia o reconhecimento
      }

      const endTime = Date.now();
      const durationInSeconds = (endTime - this.startRecordingDate) / 1000;
      const durationInMinutes = durationInSeconds / 60;
      this.duration = durationInMinutes.toFixed(2).toString().replace('.', ':');
    };

    this.recognition.start();
  }

  //PARAR RECONHECIMENTO
  stopListening() {
    if (this.recognition) {
      this.isRecording = false;
      this.recognition.stop();
      this.stopWave();
      console.log('Voice recognition stopped.');
    }
  }

  //METODOS SECUNDARIOS

  //RESET
  reset() {
    this.text = 'Fale Algo 😴';
    this.translatedText = '';
  }

  //TRADUZIR
  // translate(text: string): string {
  //   debugger
  //   const words = text.toLowerCase().split(' '); // Divide as palavras do texto
  //   const translatedWords = words.map(word => this.dicionarioEN[word] || word); // Traduz ou mantém a palavra original
  //   return translatedWords.join(' '); // Junta as palavras traduzidas
  // }
  translate(text: string): string {
    const trimmedText = text.trim().toLowerCase(); 

    let dicionario:any;
    if(this.linguagemPadrao1 == 'português' && this.linguagemPadrao2 == 'inglês'){
      dicionario = this.dicionarioPTEN;
    }
    if(this.linguagemPadrao1 == 'português' && this.linguagemPadrao2 == 'espanhol'){
      dicionario = this.dicionarioPTES;
    }
    if(this.linguagemPadrao1 == 'português' && this.linguagemPadrao2 == 'francês'){
      dicionario = this.dicionarioPTFR;
    }

    const phrases = Object.keys(dicionario);
  
    let translatedText = trimmedText;
  
    phrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (regex.test(translatedText)) {
        translatedText = translatedText.replace(regex, dicionario[phrase]);
      }
    });
  
    const words = translatedText.split(' ');
    const translatedWords = words.map(word => dicionario[word] || word);
    
    return translatedWords.join(' ');
  }

  //FALAR TEXTO
  toggleText(){
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
  saveTextAsPDF() {
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

  //COPIAR TEXTO
  copyText() {
    const texto = this.text + '\n' + this.translatedText;
    
    // Verifica se a API Clipboard está disponível no navegador
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        console.log('Texto copiado para a área de transferência');
      }).catch(err => {
        console.error('Erro ao copiar texto', err);
      });
    } else {
      console.error('API Clipboard não suportada neste navegador');
    }
  }

  //COMPARTILHAR TEXTO
  shareTranscription() {
    const text = this.text + '\n' + this.translatedText;
  
    if (navigator.share) {
      navigator.share({
        title: 'Minha Transcrição',
        text: text,
        url: window.location.href,
      })
      .then(() => console.log('Compartilhamento bem-sucedido!'))
      .catch((error) => console.error('Erro ao compartilhar:', error));
    } else {
      console.log('Compartilhamento não suportado');
    }
  }

  //ALERTA
  async presentConfirmationAlert(action: 'save' | 'delete') {
    const alert = await this.alertController.create({
      header: 'Translator',
      message: action === 'save' ? 'Deseja salvar a transcrição?' : 'Deseja deletar a transcrição?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {
            console.log('Ação cancelada');
          }
        },
        {
          text: 'Sim',
          handler: () => {
            if (action === 'save') {
              this.saveTranscriptionToDB();
            } else if (action === 'delete') {
              this.deleteTranscriptionToDB();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  //SALVAR TRANSCRIÇÕES
  saveTranscriptionToDB() {
      if(!this.isRecording){
        const transcricao = {
            text: this.text,
            translatedText: this.translatedText,
            duration: this.duration
        };
  
        this.http.post<TranscricaoResponse>('https://192.168.1.231:3000/setTranscricoes', transcricao).subscribe(
            response => {
                alert('Transcrição salva !!')
                /* this.transcricaoId = response.insertId; */
                this.reset();
            },
            error => {
                alert('Erro ao salvar transcrição:' + error)
            }
        );
      }
  }

  //RECUPERAR TRANSCRIÇÕES
  getTranscriptionsFromDB() {
      this.http.get('https://192.168.1.231:3000/getTranscricoes').subscribe(
          (response: any) => {
              console.log('Transcrições recebidas:', response);
          },
          error => {
              console.error('Erro ao buscar transcrições:', error);
          }
      );
  }

  //DELETAR TRANSCRIÇÕES
  deleteTranscriptionToDB() {
      if(!this.isRecording && this.transcricaoId){
        const id = {
            transcricaoId: this.transcricaoId,
        };

        this.http.post('https://192.168.1.231:3000/deleteTranscricoes', id).subscribe(
            response => {
                alert('Transcrição deletada !!')
            },
            error => {
                alert('Erro ao deletar transcrição:' + error)
            }
        );
      }
  }

  /* async checkPermission() {
    const permission = await SpeechRecognition.checkPermissions();
    console.log(permission);
  } */

  //ONDA CANVAS
  drawWaveform() {
    const canvas = document.querySelector('#audioCanvas') as HTMLCanvasElement;
    canvas.style.display = 'block';
    
    if (!canvas) {
      this.ngZone.run(() => {
        this.text = 'Canvas não encontrado!';
      });
      return;
    }
    const canvasCtx = canvas.getContext('2d')!;
    if (!canvasCtx) {
      this.ngZone.run(() => {
        this.text = 'Contexto do canvas não encontrado!';
      });
      return;
    }

    const barWidth = 2; // Largura da barra mais fina
    let time = 0; // Variável de tempo para animar a onda (como se fosse uma onda de áudio real)
    
    const draw = () => {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas a cada quadro
      canvasCtx.fillStyle = 'rgb(255, 255, 255, 0)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      let x = 0;

      // Criando barras que imitam um visualizador de áudio real
      for (let i = 0; i < 100; i++) {
        // Simula a intensidade da onda de áudio com base em uma função sinusoidal e ruído mais agressivo
        const noise = Math.random() * 60; // Aumenta o ruído para maior variação
        const barHeight = (Math.sin((time + i) * 0.1) * 50 + noise) + (canvas.height / 2);
        const yPosition = (canvas.height + 100) - barHeight / 2;

        // Desenhando a barra com uma cor que muda dependendo da altura
        canvasCtx.fillStyle = `rgb(255, 50, 50)`; 
        canvasCtx.fillRect(x, yPosition / 2, barWidth, barHeight);

        x += barWidth + 1; // Deslocamento para a próxima barra
      }

      // Incrementa o tempo para criar o movimento contínuo da onda
      time += 0.4; // Aumente o valor para mover mais rápido ou diminua para mais lento

      requestAnimationFrame(draw); // Chama a função para continuar desenhando
    };
  
    this.animationFrameId = requestAnimationFrame(draw);
    draw();
  }
  
  stopWave() {
    const canvas = document.getElementById('audioCanvas') as HTMLCanvasElement;
    canvas.style.display = 'none';
    cancelAnimationFrame(this.animationFrameId);
  }
}