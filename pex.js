function verificarConta() {
    var nomeOrigem = document.getElementById('nome_origem').value;
    var chaveOrigem = document.getElementById('chave_origem').value;
    var nomeDestino = document.getElementById('nome_destino').value;
    var chaveDestino = document.getElementById('chave_destino').value;

    fetch(`https://etec23-e0755-default-rtdb.firebaseio.com/chaves/${chaveOrigem}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na solicitação.');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.saldo !== undefined) {
                var saldoOrigem = data.saldo;

                // Verificar também a conta de destino
                fetch(`https://etec23-e0755-default-rtdb.firebaseio.com/chaves/${chaveDestino}.json`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Erro na solicitação.');
                        }
                        return response.json();
                    })
                    .then(dataDestino => {
                        if (dataDestino && dataDestino.saldo !== undefined) {
                            var saldoDestino = dataDestino.saldo;
                            processarPagamento(nomeOrigem, chaveOrigem, saldoOrigem, nomeDestino, chaveDestino, saldoDestino);
                        } else {
                            alert(`A conta de destino não foi encontrada no Firebase.`);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao verificar conta de destino:', error);
                    });
            } else {
                alert(`A conta de origem não foi encontrada no Firebase.`);
            }
        })
        .catch(error => {
            console.error('Erro ao verificar conta de origem:', error);
        });
}

function processarPagamento(nomeOrigem, chaveOrigem, saldoOrigem, nomeDestino, chaveDestino, saldoDestino) {
    var valorTransacao = parseFloat(document.getElementById('valor_transacao').value);

    if (valorTransacao > saldoOrigem) {
        alert("Saldo insuficiente para realizar a transação.");
        return;
    }

    var novoSaldoOrigem = saldoOrigem - valorTransacao;

    // Atualizar saldo da conta de origem
    fetch(`https://etec23-e0755-default-rtdb.firebaseio.com/chaves/${chaveOrigem}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ saldo: novoSaldoOrigem })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar saldo da conta de origem.');
        }
        return response.json();
    })
    .then(data => {
        // Atualizar saldo da conta de destino
        var novoSaldoDestino = saldoDestino + valorTransacao;
        return fetch(`https://etec23-e0755-default-rtdb.firebaseio.com/chaves/${chaveDestino}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ saldo: novoSaldoDestino })
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar saldo da conta de destino.');
        }
        return response.json();
    })
    .then(data => {
        alert("Transação concluída com sucesso!");
    })
    .catch(error => {
        console.error('Erro ao processar pagamento:', error);
    });
}
