# Glosario de Términos

Términos de negocio utilizados en el sistema MateriaGris.

| Término | Definición |
|---------|------------|
| **Paciente** | Persona física que recibe atención médica. Es la entidad central del sistema. |
| **Usuario del sistema** | Persona que opera el sistema (médico, administrador, recepcionista). No confundir con paciente. |
| **Consulta** | Evento de atención médica donde un médico evalúa a un paciente. |
| **Receta** | Orden médica para la dispensación de medicamentos. Asociada a una consulta. |
| **Orden de laboratorio** | Solicitud de pruebas de laboratorio asociada a una consulta. |
| **Orden de imagenología** | Solicitud de estudios de imagen (rayos X, resonancia, etc.) asociada a una consulta. |
| **Rol** | Conjunto de permisos que define lo que un usuario puede hacer en el sistema. Ej: `médico`, `admin`, `recepcionista`. |
| **Permiso** | Acción atómica que un usuario puede realizar. Ej: `patient.view`, `admin.user.create`. |
| **Grant (+1)** | Concesión de un permiso (allow). |
| **Deny (-1)** | Denegación explícita de un permiso. Tiene prioridad sobre grant. |
| **Override** | Permiso asignado directamente a un usuario, por encima de los permisos heredados de sus roles. |
| **RBAC** | Role-Based Access Control — control de acceso basado en roles. |
| **JWT** | JSON Web Token — mecanismo de autenticación sin estado. |
| **Soft Delete** | Borrado lógico: los registros no se eliminan físicamente, solo se marcan como eliminados. |
| **NSS** | Número de Seguridad Social (identificador único del paciente). |
