-- Agregar todas las especialidades médicas faltantes
-- Primero actualizamos las existentes para que tengan nombres más completos

UPDATE specialties SET name = 'Ginecología y Obstetricia' WHERE name = 'Ginecología';
UPDATE specialties SET name = 'Ortopedia y Traumatología' WHERE name = 'Ortopedia';

-- Ahora insertamos las especialidades faltantes
INSERT INTO specialties (name, description) VALUES
-- Medicina Interna y especialidades relacionadas
('Medicina Interna', 'Diagnóstico y tratamiento de enfermedades internas del adulto'),
('Endocrinología', 'Diagnóstico y tratamiento de trastornos hormonales y metabólicos'),
('Gastroenterología', 'Diagnóstico y tratamiento de enfermedades del sistema digestivo'),
('Geriatría', 'Atención médica especializada para adultos mayores'),
('Hematología', 'Diagnóstico y tratamiento de enfermedades de la sangre'),
('Infectología', 'Diagnóstico y tratamiento de enfermedades infecciosas'),
('Medicina Deportiva', 'Prevención y tratamiento de lesiones relacionadas con el deporte'),
('Nefrología', 'Diagnóstico y tratamiento de enfermedades renales'),
('Neumología', 'Diagnóstico y tratamiento de enfermedades respiratorias'),
('Neurología', 'Diagnóstico y tratamiento de enfermedades del sistema nervioso'),
('Nutriología Clínica', 'Evaluación y tratamiento nutricional especializado'),
('Oncología', 'Diagnóstico y tratamiento del cáncer'),
('Reumatología', 'Diagnóstico y tratamiento de enfermedades reumáticas y autoinmunes'),

-- Especialidades quirúrgicas
('Alergología', 'Diagnóstico y tratamiento de alergias e inmunología clínica'),
('Anestesiología', 'Manejo anestésico y cuidados perioperatorios'),
('Angiología y Cirugía Vascular', 'Cirugía de vasos sanguíneos y sistema circulatorio'),
('Cirugía General', 'Procedimientos quirúrgicos generales y abdominales'),
('Cirugía Plástica', 'Cirugía reconstructiva y estética'),
('Cirugía Torácica', 'Cirugía de tórax, pulmones y mediastino'),
('Neurocirugía', 'Cirugía del sistema nervioso central y periférico'),
('Otorrinolaringología', 'Cirugía y medicina de oído, nariz y garganta'),
('Urología', 'Cirugía y medicina del sistema genitourinario'),

-- Especialidades pediátricas y materno-infantiles
('Neonatología', 'Cuidados médicos especializados para recién nacidos'),

-- Medicina de emergencias y familiar
('Medicina de Emergencias', 'Atención médica de urgencias y cuidados críticos'),
('Medicina Familiar', 'Atención médica integral para toda la familia'),
('Medicina Preventiva', 'Prevención de enfermedades y promoción de la salud'),
('Medicina del Trabajo', 'Salud ocupacional y medicina laboral'),

-- Especialidades diagnósticas
('Patología', 'Diagnóstico de enfermedades mediante análisis de tejidos'),
('Radiología', 'Diagnóstico por imágenes médicas'),

-- Especialidades de rehabilitación y otras
('Medicina Física y Rehabilitación', 'Rehabilitación y medicina física'),
('Genética Médica', 'Diagnóstico y consejo genético'),
('Medicina Paliativa', 'Cuidados paliativos y manejo del dolor')

ON CONFLICT (name) DO NOTHING;

-- Verificar que todas las especialidades se insertaron correctamente
SELECT COUNT(*) as total_especialidades FROM specialties;