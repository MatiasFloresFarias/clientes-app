import { Injectable } from '@angular/core';
import { formatDate, DatePipe, registerLocaleData } from '@angular/common';

import { CLIENTES } from './clientes.json';
import { Cliente } from './cliente';
import { of, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable()
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient, private router: Router) { }

  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        console.log('ClienteService: tap 1');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
      }),
      
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          // cambia el formato de fecha a mayuscula
          cliente.nombre = cliente.nombre.toUpperCase();

          let datePipe = new DatePipe('es-Cl');
          cliente.createdAt = datePipe.transform(cliente.createdAt, 'EEEE dd, MMMM yyyy');
          // cliente.createAt = formatDate(cliente.createAt,'dd-MM-yyyy', 'en-US');
          return cliente;
        });
        return response;
      }),
      tap(response => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach(cliente => {
          console.log(cliente.nombre)
        })
      }));
  }

  create(cliente: Cliente): Observable<any> {
    return this.http.post<any>(this.urlEndPoint, cliente, { headers: this.httpHeaders }).pipe(catchError(e => { // capturo el error 400 del servidor
      if (e.status == 400) {
        return throwError(e);
      }
      swal(e.error.mensaje, e.error.error, 'error');
      return throwError(e);
    }));
  }

  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${
      this.urlEndPoint
      }/${id}`).pipe(catchError(e => {
        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje)
        swal('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      }))
  }

  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${
      this.urlEndPoint
      }/${
      cliente.id
      }`, cliente, { headers: this.httpHeaders }).pipe(catchError(e => {

        if (e.status == 400) {
          return throwError(e);
        }

        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      }));
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${
      this.urlEndPoint
      }/${id}`, { headers: this.httpHeaders }).pipe(catchError(e => {
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      }));
  }

}
