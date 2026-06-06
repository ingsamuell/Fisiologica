import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Configuración de Supabase (¡Pon tus datos aquí!)
const supabaseUrl = 'https://ihnknfacbcrmvqxntswa.supabase.co';
const supabaseKey = 'sb_publishable_C8DtOf0lcVaMfkKHrFuKNQ_5Up0jifV';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para obtener la fecha de hoy en formato YYYY-MM-DD
const obtenerFechaHoy = () => new Date().toISOString().split('T')[0];

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const estadoInicialFormulario = {
    nombre: '', cedula: '', fecha_consulta: obtenerFechaHoy(), genero: '', fecha_nacimiento: '', 
    ocupacion: '', direccion: '', telefono: '', email: '', antecedentes: '', 
    lesion_actual: '', cirugias: '', dx_medico: '', dolor: '', inflamacion: '', 
    perdida_movilidad: '', debilidad_muscular: '', dx_fisioterapeuta: '', 
    tratamiento: '', descripcion_paciente: ''
  };
  
  const [formData, setFormData] = useState(estadoInicialFormulario);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPacientes(data);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      const { error } = await supabase.from('pacientes').update(formData).eq('id', editId);
      if (error) alert('Error al actualizar: ' + error.message);
      else {
        alert('¡Historial actualizado con éxito!');
        cancelarEdicion();
        fetchPacientes();
      }
    } else {
      const { error } = await supabase.from('pacientes').insert([formData]);
      if (error) alert('Error al guardar: ' + error.message);
      else {
        alert('¡Paciente registrado con éxito!');
        cancelarEdicion();
        fetchPacientes();
      }
    }
  };

  const cargarParaEditar = (paciente) => {
    setFormData(paciente);
    setIsEditing(true);
    setEditId(paciente.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarPaciente = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este historial por completo? Esta acción no se puede deshacer.')) {
      const { error } = await supabase.from('pacientes').delete().eq('id', id);
      if (error) alert('Error al eliminar: ' + error.message);
      else fetchPacientes();
    }
  };

  const cancelarEdicion = () => {
    setFormData(estadoInicialFormulario);
    setIsEditing(false);
    setEditId(null);
  };

  const pacientesFiltrados = pacientes.filter(p => 
    (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (p.cedula && p.cedula.includes(busqueda))
  );

  const esIncompleto = (p) => {
    return !p.lesion_actual || !p.dx_medico || !p.tratamiento || !p.dx_fisioterapeuta;
  };

  const inputEstilo = "bg-white border border-slate-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-slate-800 placeholder-slate-400 shadow-sm";
  const labelEstilo = "block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-8 flex flex-col xl:flex-row gap-8 font-sans">
      
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <div className="xl:w-2/3 bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-slate-400/20 border border-slate-300">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-lg ${isEditing ? 'bg-amber-500 shadow-amber-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                {isEditing ? 'Editando Historial' : 'Registro Clínico'}
              </h2>
              <p className="text-slate-500 font-medium mt-1">
                {isEditing ? 'Modifica los datos y presiona actualizar' : 'Completa los datos del paciente'}
              </p>
            </div>
          </div>
          {isEditing && (
            <button onClick={cancelarEdicion} type="button" className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition">
              Cancelar Edición
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-inner">
            <h3 className="font-bold text-slate-800 mb-5 text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span> Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelEstilo}>Nombre Completo</label>
                <input required name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej. Juan Pérez" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Cédula de Identidad</label>
                <input required name="cedula" value={formData.cedula} onChange={handleInputChange} placeholder="Ej. 12345678" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} className={`${inputEstilo} text-slate-600`} />
              </div>
              <div>
                <label className={labelEstilo}>Género</label>
                <input name="genero" value={formData.genero} onChange={handleInputChange} placeholder="Ej. Masculino" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Fecha de Consulta</label>
                <input type="date" name="fecha_consulta" value={formData.fecha_consulta} onChange={handleInputChange} className={`${inputEstilo} text-slate-600`} />
              </div>
              <div>
                <label className={labelEstilo}>Ocupación</label>
                <input name="ocupacion" value={formData.ocupacion} onChange={handleInputChange} placeholder="Ej. Estudiante" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Teléfono</label>
                <input name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Ej. 0414-1234567" className={inputEstilo} />
              </div>
              <div className="md:col-span-2">
                <label className={labelEstilo}>Correo Electrónico</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ejemplo@correo.com" className={inputEstilo} />
              </div>
              <div className="md:col-span-3">
                <label className={labelEstilo}>Dirección de Habitación</label>
                <input name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección detallada" className={inputEstilo} />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-inner">
            <h3 className="font-bold text-slate-800 mb-5 text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span> Historial Médico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelEstilo}>Antecedentes Médicos</label>
                <textarea name="antecedentes" value={formData.antecedentes} onChange={handleInputChange} placeholder="Enfermedades previas, alergias..." rows="2" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Lesión Actual (Motivo)</label>
                <textarea name="lesion_actual" value={formData.lesion_actual} onChange={handleInputChange} placeholder="Razón de la consulta" rows="2" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Cirugías Previas</label>
                <textarea name="cirugias" value={formData.cirugias} onChange={handleInputChange} placeholder="¿Le han practicado cirugía? Especifique" rows="2" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Diagnóstico Médico</label>
                <textarea name="dx_medico" value={formData.dx_medico} onChange={handleInputChange} placeholder="Diagnóstico dado por un médico" rows="2" className={inputEstilo} />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-inner">
            <h3 className="font-bold text-slate-800 mb-5 text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span> Síntomas y Plan de Tratamiento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelEstilo}>Nivel y Zona de Dolor</label>
                <input name="dolor" value={formData.dolor} onChange={handleInputChange} placeholder="Ej. Moderado en zona lumbar" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Inflamación</label>
                <input name="inflamacion" value={formData.inflamacion} onChange={handleInputChange} placeholder="Ej. Leve en rodilla derecha" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Pérdida de Movilidad</label>
                <input name="perdida_movilidad" value={formData.perdida_movilidad} onChange={handleInputChange} placeholder="Especifique si aplica" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Debilidad Muscular</label>
                <input name="debilidad_muscular" value={formData.debilidad_muscular} onChange={handleInputChange} placeholder="Especifique si aplica" className={inputEstilo} />
              </div>
              <div className="md:col-span-2">
                <label className={labelEstilo}>Descripción General (¿Qué siente el paciente?)</label>
                <textarea name="descripcion_paciente" value={formData.descripcion_paciente} onChange={handleInputChange} placeholder="Relato detallado de los síntomas" rows="2" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Diagnóstico del Fisioterapeuta</label>
                <textarea name="dx_fisioterapeuta" value={formData.dx_fisioterapeuta} onChange={handleInputChange} placeholder="Conclusión fisioterapéutica" rows="2" className={inputEstilo} />
              </div>
              <div>
                <label className={labelEstilo}>Tratamiento a Seguir</label>
                <textarea name="tratamiento" value={formData.tratamiento} onChange={handleInputChange} placeholder="Plan de ejercicios o terapias" rows="2" className={inputEstilo} />
              </div>
            </div>
          </div>

          <button type="submit" className={`w-full text-white font-extrabold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-lg uppercase tracking-wide border ${isEditing ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 border-amber-600' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 border-blue-800'}`}>
            {isEditing ? 'Actualizar Historial' : 'Guardar Historial'}
          </button>
        </form>
      </div>

      {/* SECCIÓN DERECHA: BÚSQUEDA Y TARJETAS */}
      <div className="xl:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-400/20 border border-slate-300 sticky top-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800">Directorio</h2>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-300">
              {pacientesFiltrados.length} Registros
            </span>
          </div>
          
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-slate-800 text-sm rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 block w-full pl-4 p-4 shadow-inner outline-none transition-all placeholder-slate-500"
            />
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2" style={{scrollbarWidth: 'thin'}}>
            {pacientesFiltrados.map((paciente) => {
              const incompleto = esIncompleto(paciente);
              return (
                <div key={paciente.id} className={`p-5 rounded-2xl border transition-all duration-200 border-l-4 group ${incompleto ? 'bg-amber-50 border-amber-200 hover:border-amber-400 border-l-amber-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300 border-l-blue-600'}`}>
                  
                  {/* Fila superior: Nombre, CI y la Etiqueta de Estado integrados en el layout */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">{paciente.nombre}</h3>
                      <p className="text-sm text-slate-500 font-semibold mt-1">C.I: {paciente.cedula}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest shadow-sm border ${incompleto ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-green-100 text-green-800 border-green-300'}`}>
                      {incompleto ? 'Borrador' : 'Completa'}
                    </span>
                  </div>
                  
                  <div className={`mt-2 p-3 rounded-xl text-sm border ${incompleto ? 'bg-amber-100/50 border-amber-200/50 text-amber-900' : 'bg-slate-200 border-slate-300 text-slate-700'}`}>
                    <span className="font-bold block mb-1 text-[10px] uppercase tracking-widest">Consulta: {paciente.fecha_consulta || 'Sin fecha'}</span>
                    <p className="truncate opacity-90">{paciente.lesion_actual || paciente.dx_medico || 'Falta información de la lesión'}</p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => cargarParaEditar(paciente)} className="bg-white border border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Editar
                    </button>
                    <button onClick={() => eliminarPaciente(paciente.id)} className="bg-white border border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Borrar
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}