import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  feedbacks: any[] = [];

  constructor(
    private http: HttpClient,
    private appComponent: AppComponent
  ) {}

  ngOnInit() {
    this.getTranscriptionsFeedbacksFromDB();
  }

  ionViewWillEnter() {
    this.getTranscriptionsFeedbacksFromDB();
  }

  //LIGHT E DARK MODE
  toggle_lightDarkMode() {
    this.appComponent.toggle_lightDarkMode();
  }

  converterDuracaoParaExtenso(duracao: string): string {
    const partes = duracao.split(':'); // Divide em horas e minutos ou minutos e segundos

    let minutos = 0;
    let segundos = 0;

    if (partes.length === 2) {
      // Caso seja no formato "mm:ss"
      minutos = parseInt(partes[0], 10);
      segundos = parseInt(partes[1], 10);
    } else if (partes.length === 3) {
      // Caso seja no formato "HH:mm:ss"
      minutos = parseInt(partes[1], 10);
      segundos = parseInt(partes[2], 10);
    }

    let duracaoExtensa = '';

    if (minutos > 0) {
      duracaoExtensa += `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    }

    if (segundos > 0) {
      if (duracaoExtensa) duracaoExtensa += ' e ';
      duracaoExtensa += `${segundos} segundo${segundos > 1 ? 's' : ''}`;
    }

    return duracaoExtensa || '0 segundos';
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
  getTranscriptionsFeedbacksFromDB() {
      this.http.get('https://192.168.1.231:3000/getFeedbacks').subscribe(
          (response: any) => {
              for (let i = 0; i < response.length; i++) {
                response[i].duracaoDia = this.calcularDuracaoDia(response[i].created_at);
                response[i].duracaoPorExtenso = this.converterDuracaoParaExtenso(response[i].duracao);
              }
              this.feedbacks = response;
              console.log('Transcrições recebidas:', response);
          },
          error => {
              console.error('Erro ao buscar transcrições:', error);
          }
      );
  }

}
