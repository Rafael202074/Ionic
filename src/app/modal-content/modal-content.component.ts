import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss'],
})
export class ModalContentComponent  implements OnInit {
  
  constructor(private modalController: ModalController, private http: HttpClient) {}

  ngOnInit() {}

  @Input() modalData: any;

  // Fechar o modal e enviar dados
  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
      modalData: this.modalData
    });
  }

  // Gravar os dados e fechar o modal
  saveData() {
    if (this.modalData.numero > 5) {
      alert('O número não pode ser maior que 5');
      return;
    }

    this.saveFeedbackToDB();
    this.dismiss();
  }

  saveFeedbackToDB() {
    debugger
    if(this.modalData.transcricaoId != 0){
      const feedback = {
        transcricaoId: this.modalData.transcricaoId,
        comentario: this.modalData.comentario,
        estrelas: this.modalData.estrelas,
      };

      this.http.post('https://192.168.1.231:3000/setFeedbacks', feedback).subscribe(
          response => {
              alert('Feedback salvo !!')
          },
          error => {
              alert('Erro ao salvar feedback:' + error)
          }
      );
    }
}
}
