-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         10.4.32-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para tfg_3
CREATE DATABASE IF NOT EXISTS `tfg_3` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `tfg_3`;

-- Volcando estructura para tabla tfg_3.collection
CREATE TABLE IF NOT EXISTS `collection` (
  `id` varchar(36) NOT NULL,
  `shortId` varchar(8) NOT NULL,
  `name` varchar(200) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_adf8e3a9a3aab9975078970918` (`shortId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.collection_pubis
CREATE TABLE IF NOT EXISTS `collection_pubis` (
  `collection_id` varchar(36) NOT NULL,
  `pubis_id` varchar(36) NOT NULL,
  PRIMARY KEY (`collection_id`,`pubis_id`),
  KEY `IDX_858ebb1bed993d56ac98030423` (`collection_id`),
  KEY `IDX_21e37c663046bb5524e26817c9` (`pubis_id`),
  CONSTRAINT `FK_21e37c663046bb5524e26817c9a` FOREIGN KEY (`pubis_id`) REFERENCES `pubis` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_858ebb1bed993d56ac980304239` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.digital_model
CREATE TABLE IF NOT EXISTS `digital_model` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `acquisition_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `model_type` varchar(255) NOT NULL,
  `pubisId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b16581ba6e5c4c4a0734160eb05` (`pubisId`),
  CONSTRAINT `FK_b16581ba6e5c4c4a0734160eb05` FOREIGN KEY (`pubisId`) REFERENCES `pubis` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.experiment
CREATE TABLE IF NOT EXISTS `experiment` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `userId` varchar(36) DEFAULT NULL,
  `pubisId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_efd004fa410567831df8dd764fb` (`userId`),
  KEY `FK_f2ec084b78841e525e94dcbe443` (`pubisId`),
  CONSTRAINT `FK_efd004fa410567831df8dd764fb` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f2ec084b78841e525e94dcbe443` FOREIGN KEY (`pubisId`) REFERENCES `pubis` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.file
CREATE TABLE IF NOT EXISTS `file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `digitalModelId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_067ff8047dc5c092e237a3cc6a5` (`digitalModelId`),
  CONSTRAINT `FK_067ff8047dc5c092e237a3cc6a5` FOREIGN KEY (`digitalModelId`) REFERENCES `digital_model` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=307 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.label
CREATE TABLE IF NOT EXISTS `label` (
  `id` varchar(36) NOT NULL,
  `shortId` varchar(8) NOT NULL,
  `auricular_face_ridges_and_grooves` varchar(255) NOT NULL,
  `auricular_face_irregular_pososity` varchar(255) NOT NULL,
  `upper_symphyseal_extremity_definition` varchar(255) NOT NULL,
  `upper_symphyseal_extremity_bony_nodule` varchar(255) NOT NULL,
  `lower_symphyseal_extremity_definition` varchar(255) NOT NULL,
  `dorsal_groove_definition` varchar(255) NOT NULL,
  `dorsal_groove_dorsal_plateau` varchar(255) NOT NULL,
  `ventral_margin_ventral_bevel` varchar(255) NOT NULL,
  `ventral_margin_ventral_margin` varchar(255) NOT NULL,
  `toddPhasePractitioner` varchar(255) NOT NULL,
  `label_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_510afd86d1c215f1f6ae65c8f4` (`shortId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.pubis
CREATE TABLE IF NOT EXISTS `pubis` (
  `id` varchar(36) NOT NULL,
  `shortId` varchar(8) NOT NULL,
  `laterality` varchar(200) NOT NULL,
  `preservation_state` varchar(200) NOT NULL,
  `subjectShortId` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2b531063a06523e0b52612306c` (`shortId`),
  KEY `FK_7d3c9f0e5ba514e9576837aaa85` (`subjectShortId`),
  CONSTRAINT `FK_7d3c9f0e5ba514e9576837aaa85` FOREIGN KEY (`subjectShortId`) REFERENCES `subject` (`shortId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.pubis_label
CREATE TABLE IF NOT EXISTS `pubis_label` (
  `id` varchar(36) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `pubisId` varchar(36) DEFAULT NULL,
  `labelId` varchar(36) DEFAULT NULL,
  `userId` varchar(36) DEFAULT NULL,
  `isTraining` tinyint(4) NOT NULL DEFAULT 0,
  `score` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8fed21fc164c6d4245148bb0927` (`pubisId`),
  KEY `FK_3f5f88283df5a86f323fa60a3ad` (`labelId`),
  KEY `FK_2b5247a84c2cce97118822feff4` (`userId`),
  CONSTRAINT `FK_2b5247a84c2cce97118822feff4` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_3f5f88283df5a86f323fa60a3ad` FOREIGN KEY (`labelId`) REFERENCES `label` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8fed21fc164c6d4245148bb0927` FOREIGN KEY (`pubisId`) REFERENCES `pubis` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.role
CREATE TABLE IF NOT EXISTS `role` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` varchar(400) NOT NULL,
  `date` date NOT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.subject
CREATE TABLE IF NOT EXISTS `subject` (
  `name` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `sex` varchar(255) NOT NULL,
  `biological_age_at_death` int(11) NOT NULL,
  `preliminary_proceedings` varchar(255) NOT NULL,
  `toxicological_report` varchar(255) NOT NULL,
  `death_cause` varchar(255) NOT NULL,
  `body_build` varchar(255) NOT NULL,
  `judged` varchar(255) NOT NULL,
  `acquisition_year` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id` varchar(36) NOT NULL,
  `shortId` varchar(8) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8bcd7b04808cc3f92bcb5bbb85` (`shortId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `lastname` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `status` varchar(200) NOT NULL,
  `description` varchar(500) NOT NULL,
  `creation_date` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `update_date` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `resetPasswordToken` varchar(200) DEFAULT NULL,
  `resetPasswordExpires` timestamp NULL DEFAULT NULL,
  `roleId` varchar(36) DEFAULT NULL,
  `photoUrl` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_c28e52f758e7bbc53828db92194` (`roleId`),
  CONSTRAINT `FK_c28e52f758e7bbc53828db92194` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla tfg_3.user_collections
CREATE TABLE IF NOT EXISTS `user_collections` (
  `user_id` varchar(36) NOT NULL,
  `collection_id` varchar(36) NOT NULL,
  PRIMARY KEY (`user_id`,`collection_id`),
  KEY `IDX_64c12326d36a9ead157b3757d4` (`user_id`),
  KEY `IDX_1de19dd2107ce1c5f63073f76b` (`collection_id`),
  CONSTRAINT `FK_1de19dd2107ce1c5f63073f76b5` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_64c12326d36a9ead157b3757d43` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
