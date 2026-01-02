CREATE TABLE `condominios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`endereco` text,
	`telefone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `condominios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `encomendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`moradorId` int NOT NULL,
	`apartamento` varchar(20) NOT NULL,
	`tipo` enum('carta','pacote','delivery') NOT NULL,
	`fotoUrl` text,
	`fotoKey` text,
	`observacoes` text,
	`status` enum('pendente','retirada') NOT NULL DEFAULT 'pendente',
	`porteiroRegistroId` int NOT NULL,
	`porteiroRegistroNome` varchar(255),
	`dataHoraRegistro` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `encomendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moradores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`apartamento` varchar(20) NOT NULL,
	`telefone` varchar(20),
	`email` varchar(320),
	`userId` int,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moradores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`userId` int NOT NULL,
	`moradorId` int,
	`encomendaId` int,
	`tipo` enum('nova_encomenda','encomenda_retirada','sistema') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`lida` boolean NOT NULL DEFAULT false,
	`dataHoraLeitura` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retiradas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`encomendaId` int NOT NULL,
	`condominioId` int NOT NULL,
	`nomeQuemRetirou` varchar(255) NOT NULL,
	`assinatura` text,
	`observacoes` text,
	`porteiroRetiradaId` int,
	`porteiroRetiradaNome` varchar(255),
	`dataHoraRetirada` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `retiradas_id` PRIMARY KEY(`id`),
	CONSTRAINT `retiradas_encomendaId_unique` UNIQUE(`encomendaId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('porteiro','morador','sindico','admin') NOT NULL DEFAULT 'morador';--> statement-breakpoint
ALTER TABLE `users` ADD `condominioId` int;