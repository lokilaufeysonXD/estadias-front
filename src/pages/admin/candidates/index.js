import React, { useState, useEffect } from 'react';
import LayoutAdmin from '@/components/LayoutAdmin';
import useSWR from 'swr';
import ButtonTable from '@/components/CandidatesComponents/ButtonTable';
import PopupInsertC from '@/components/CandidatesComponents/PopupInsertC';
import PopupEdit from '@/components/CandidatesComponents/PopupUpdateC';
import RequireAuth from '@/components/UtilsComponents/RequireAuth';

// manejo del encabezado trae el encabezado y el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// modificacion de la funcion fetcher para que pueda manejar los encabezados 
const fetcher = async (url) => {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(errorDetails || 'Error fetching data');
  }
  const data = await response.json();
  return data.candidates; //para devolver el array directamente
};

const fetchCompanies = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/companyfront`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(errorDetails || 'Error fetching data');
  }
  const data = await response.json();
  return data; // se asume que `data` es un array de compañías
};

const fetchVacancies = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/vacanciesfront`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(errorDetails || 'Error fetching data');
  }
  const data = await response.json();
  console.log('Fetched vacancies:', data.vacancies); // Verifica que los datos lleguen correctamente
  return data.vacancies; // Devuelve el array de vacantes
};

const CandidateData = () => {
  const { data, error, isLoading, mutate } = useSWR(`${process.env.NEXT_PUBLIC_API_KEY}/candidates`, fetcher);
  const { data: companies = [] } = useSWR(`${process.env.NEXT_PUBLIC_API_KEY}/companyfront`, fetchCompanies);
  const { data: vacancies = [] } = useSWR(`${process.env.NEXT_PUBLIC_API_KEY}/vacanciesfront`, fetchVacancies);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);

  // Definir showCompanyColumn basado en el email almacenado en localStorage
  const [showCompanyColumn, setShowCompanyColumn] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail && storedEmail !== 'techpech@protonmail.mx') {
      setShowCompanyColumn(false);
    }
  }, []);

  if (error) return <div><RequireAuth /></div>;
  if (isLoading) return <div>Cargando...</div>;

  const candidates = data || [];

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleEditClick = (candidate) => {
    setCurrentCandidate(candidate);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowEditForm(false);
  };

  return (
    <LayoutAdmin>
      <h1 className="text-xl font-bold mb-6">Candidatos</h1>
      <div className="flex justify-between p-4">
        <div className="flex-grow"></div>
        <div className="w-1/6 flex items-end justify-end">
          <button
            className="mt-1 block w-full rounded-md bg-black text-white py-2 px-4"
            onClick={handleAddClick}
          >
            Agregar
          </button>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo</th>
            {showCompanyColumn && <th>Compañía</th>} {/* Mostrar la columna "Compañía" si showCompanyColumn es true */}
            <th>Aplico para</th>
            <th>Dirección</th>
            <th className='text-center'>Foto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => {
            // const vacancy = vacancies.find(vacancy => {
            //   console.log('Candidate vacancy_id:', candidate.vacancy_id);
            //   console.log('Checking vacancy id:', vacancy.id);
            //   vacancy.id === candidate.vacancy_id});
            // const company = companies.find(company => company.id === Number(candidate.company_id));
            const vacancy = vacancies.find(vacancy => Number(vacancy.id) === Number(candidate.vacancy_id));
            const company = companies.find(company => Number(company.id) === Number(candidate.company_id));
            
            console.log('Companies from SWR:', companies);
            console.log('Candidate company_id:', candidate.company_id);
            console.log('Matched company:', company ? company.name : 'Desconocida');
            console.log('machet vacancies:', vacancy ? vacancy.title : 'Desconocida')
            
            return (
              <tr key={index} className="hover">
                <th>{candidate.id}</th>
                <td>{candidate.name}</td>
                <td>
                  <a href={`tel:${candidate.phone}`} target="_self">
                    {candidate.phone}
                  </a>
                </td>
                <td>
                  <a href={`mailto:${candidate.email}`} target="_blank">
                    {candidate.email}
                  </a>
                </td>
                {showCompanyColumn && (
                  <td>{company ? company.name : 'Desconocida'}</td>
                )}
                <td>{vacancy ? vacancy.title : 'Desconocida'}</td>
                <td>{candidate.address}</td>
                <td className="text-center">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_KEY_VACANCIES_FRONT}/CurriculumPage?id=${candidate.id}`}
                    target="_blank"
                  >
                    {candidate.foto_perfil ? (
                      candidate.foto_perfil.startsWith('data:image') ? (
                        <img
                          src={candidate.foto_perfil}
                          alt="Foto de perfil"
                          style={{
                            maxHeight: "45px",
                            display: "block",
                            margin: "auto",
                          }}
                        />
                      ) : (
                        <img
                          src={`../../${candidate.foto_perfil}`}
                          alt="Foto de perfil"
                          style={{
                            maxHeight: "45px",
                            display: "block",
                            margin: "auto",
                          }}
                        />
                      )
                    ) : (
                      <img
                        src="/candidatos/PerfilUsuarioNull.avif"
                        alt="Foto de perfil por defecto"
                        style={{
                          maxHeight: "45px",
                          display: "block",
                          margin: "auto",
                        }}
                      />
                    )}
                  </a>
                </td>
                <td>
                  <ButtonTable
                    id={candidate.id}
                    mutate={mutate}
                    onEdit={() => handleEditClick(candidate)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showForm && <PopupInsertC onClose={handleCloseForm} mutate={mutate} />}
      {showEditForm && (
        <PopupEdit
          onClose={handleCloseForm}
          mutate={mutate}
          candidate={currentCandidate}
        />
      )}
    </LayoutAdmin>
  );
};

export default CandidateData;
