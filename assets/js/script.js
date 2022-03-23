'use strict'

const formListaAdesivos = {
    listaAdesivos: [],
    escolhidos : [],
    init: function(){
        formListaAdesivos.montaLista();
        formListaAdesivos.insereEvento();
        document.querySelector('.btn-envia').addEventListener('click', () => {
            if(formListaAdesivos.escolhidos.length <=0){
                formListaAdesivos.msgAvisoErro("Erro!", "Nenhum produto foi escolhido");
                return false;
            }
            $('.compra-modal').modal('show');
            const table = document.querySelector('.tabela-compra');
            formListaAdesivos.encapsulaTabela(formListaAdesivos.escolhidos,table);
        });
        document.querySelector('.btn-confirma').addEventListener('click', () => {
            const form = $('form.finaliza-compra').serializeArray();
            try {
                form.forEach(campo => {
                    console.log(campo);
                    let nome = campo.name;
                    let valor = Number(campo.value.trim());

                    if(valor <= 0 || valor === "" || isNaN(valor)) {
                        throw "A quantidade informada para compra em um dos produtos está inválida. Por favor, corrija.";
                    }
                });
                formListaAdesivos.msgAvisoErro("Pedido Finalizado", "Parabéns!");
            } catch (error) {
                formListaAdesivos.msgAvisoErro("Erro!", error);
            }
        });
    },
    msgAvisoErro : function(titulo,msg) {
        $('#modalAvisoErros').modal('show');
        $('#modalAvisoErros').find(".modal-title").html(titulo);
        $('#modalAvisoErros').find(".modal-body").html(msg);
    },
    filtraAdesivo: function(id) {
        return formListaAdesivos.listaAdesivos.filter( function(linha){
            return linha.id === id;
        });
    },
    filtraEscolhido: function(id) {
        return formListaAdesivos.escolhidos.filter( function(linha){
            return linha.id === id;
        });
    },
    addEscolhidoId: function(id){
        const arr = formListaAdesivos.filtraEscolhido(id);
        console.log(arr.length);
        if(arr.length === 0){
            let escolhe = formListaAdesivos.filtraAdesivo(id)[0];
            formListaAdesivos.escolhidos.push(escolhe);
        }
    },
    removeEscolhidoId: function(id){
        formListaAdesivos.escolhidos = formListaAdesivos.escolhidos.filter( function(linha){
            return linha.id !== id;
        });
    },
    insereEvento: function(){
        $(document).on('click','.elemento',function(){
            const $elemento = $(this);
            const id = $elemento.attr('id');
            if($elemento.hasClass('ativo')){
                formListaAdesivos.desativaElemento($elemento);
                formListaAdesivos.removeEscolhidoId(id);
            } else{
                formListaAdesivos.ativaElemento($elemento);
                formListaAdesivos.addEscolhidoId(id);
            }
        });
        $(document).on('click','.fecha-linha',function(){
            const $elemento = $(this);
            const idTodo = $elemento.attr('id');
            if(Number(idTodo.indexOf('-')) >= 0){
                const id = idTodo.split('-')[1];
                const arr = formListaAdesivos.filtraEscolhido(id);
                if(arr.length !== 0){
                    let linhaTabela = $elemento.closest(`.linha-${id}`);
                    let linhaLista = $(document).find(`#${id}`);
                    linhaTabela.remove();
                    formListaAdesivos.desativaElemento(linhaLista);
                    formListaAdesivos.removeEscolhidoId(id);
                    console.log(formListaAdesivos.escolhidos);
                }
                if(formListaAdesivos.escolhidos.length <=0){
                    $('.compra-modal').modal('hide');
                }
            }
        });
    },
    ativaElemento: function(elemento) {
        elemento.addClass('ativo');
    },
    desativaElemento: function(elemento) {
        elemento.removeClass('ativo');
    },
    desativaElemento: function(elemento) {
        elemento.removeClass('ativo');
    },
    req: async function(url, metodo){
        const retorno = await fetch(url, {
            headers: {  'Access-Control-Allow-Origin': '*' },
            type:metodo,
        });
        return retorno;
    },
    montaLista: async function() {
        const url = "./assets/json/listaAdesivos.json";
        const metodo = "GET";
        try {
            const res = await formListaAdesivos.req(url, metodo)
            .then(function(res){
                console.log(res.status);
                if(!res.ok){
                    if(res.status === 404){
                        throw "Lista Não Encontrada";
                    }
                    const err = response.statusText || response;
                    throw err;
                }
                return res.json();
            });
            if(!res.adesivos || !res || res.length <=0){
                throw "Lista Vazia";
            }
            formListaAdesivos.listaAdesivos = res.adesivos;
            const lista = document.querySelector('.lista-elementos');
            formListaAdesivos.encapsulaLista(formListaAdesivos.listaAdesivos,lista);
        } catch (error) {
            formListaAdesivos.msgAvisoErro("Erro!", error);
        }
    },
    encapsulaLista: function(elementos, lista){
        lista.innerHTML = "";
        elementos.forEach(elemento => {
            let li = document.createElement('li');
            let code = `<li class="elemento" id="${elemento.id}">
                    <i class="fa-brands ${elemento.class} imagem" ></i>
                </li>`;

            li.innerHTML = code;
            lista.appendChild(li);
        });
    },
    encapsulaTabela: function(elementos, tabela){
        tabela.innerHTML = "";
        let tbody = document.createElement('tbody');
        elementos.forEach(elemento => {
            let tr = document.createElement('tr');
            let td1 = document.createElement('td');
            //coluna 1
            td1.innerHTML = `<i class="fa-brands ${elemento.class} imagem"></i>`;
            tr.className = `linha-${elemento.id}`;
            tr.appendChild(td1);
            //coluna 2
            let td2 = document.createElement('td');
            td2.innerHTML = ` <div class="form-group campo">
                    <input type="number" name="quant-${elemento.id}" id="quant-${elemento.id}" class="form-control quantidade" min="0">
                </div>`;
            tr.appendChild(td2);
            //coluna 3
            let td3 = document.createElement('td');
            td3.innerHTML = `<button type="button"
                    class="close fecha-linha" id="fecha-${elemento.id}"> <span aria-hidden="true">&times;
                    </span>
                </button>`;
            tr.appendChild(td3);
            tbody.appendChild(tr);
        });
        tabela.appendChild(tbody);
    }
}


document.addEventListener("DOMContentLoaded", function(event) {
    formListaAdesivos.init();
});