# TODO - Sistema de Gestão de Encomendas para Condomínios

## Modelagem de Dados e Backend
- [x] Criar tabelas: condominios, usuarios (RBAC), moradores, encomendas, retiradas, notificacoes
- [x] Implementar isolamento de dados por condomínio com RLS
- [x] Criar procedures tRPC para autenticação e controle de acesso
- [x] Implementar procedures para registro de encomendas
- [x] Implementar upload de fotos via S3
- [x] Implementar sistema de notificações in-app
- [x] Implementar procedures para registro de retirada
- [x] Implementar procedures para histórico com filtros
- [x] Implementar procedures para gestão de usuários (síndico)
- [x] Implementar procedures para relatórios

## Sistema de Design e Componentes Base
- [x] Definir paleta de cores elegante e refinada
- [x] Configurar tipografia e espaçamentos
- [x] Criar componentes de layout base
- [x] Implementar sistema de navegação por perfil

## Dashboard do Porteiro
- [x] Criar tela de registro rápido de encomendas
- [x] Implementar upload de foto da encomenda
- [x] Criar listagem de encomendas pendentes
- [x] Implementar funcionalidade de marcar como retirada
- [x] Adicionar filtros e busca rápida

## Painel do Morador
- [x] Criar dashboard com encomendas pendentes
- [x] Implementar visualização de histórico próprio
- [x] Criar sistema de notificações in-app
- [x] Implementar confirmação de retirada

## Painel do Síndico
- [x] Criar dashboard com visão geral
- [x] Implementar relatórios de encomendas por período
- [x] Criar interface de gestão de usuários
- [x] Implementar configuração do condomínio
- [x] Adicionar estatísticas e métricas

## Testes e Validação
- [x] Escrever testes vitest para isolamento de dados
- [x] Testar RBAC e permissões
- [x] Testar fluxo completo de registro e retirada
- [x] Validar sistema de notificações
- [x] Testar upload e armazenamento de fotos
