import React, { useState, useEffect  } from 'react';
import LayoutAdmin from '@/components/LayoutAdmin';
import { Vacancies } from '@/services/vacancies';
import useSWR from 'swr';
import ButtonTable from '@/components/VacanciesComponents/ButtonTable';
import styles from '@/styles/Componenadm.module.css';
import PopupInsert from '@/components/VacanciesComponents/PopupInsert';
import PopupEdit from '@/components/VacanciesComponents/PopupUpdate';
import RequireAuth from '@/components/UtilsComponents/RequireAuth';
import {jwtDecode} from 'jwt-decode';



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
  console.log('Fetched data:', data); 
  return data.vacancies; //para devolver el array directamente
};


// const fetcher = async () => {
//   const { data } = await Vacancies();
//   return data.vacancies;
// }

const Vacanciedata = () => {
  const { data, error, isLoading, mutate } = useSWR(`${process.env.NEXT_PUBLIC_API_KEY}/vacancies`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentVacancie, setCurrentVacancie] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [companyID, setCompanyID] = useState(0);
  const [showCompanyColumn, setShowCompanyColumn] = useState(false); // Nueva variable de estado

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setCompanyID(decodedToken?.sub);

      // Verifica si el email es techpech@protonmail.mx
      if (decodedToken.sub === 2 || decodedToken.email === 'techpech@protonmail.mx') {
        setCanEdit(true);
        setShowCompanyColumn(true); // Mostrar columna si es techpech
      }
    }
  }, []);


  if (error) return <div><RequireAuth /></div>;
  if (isLoading) return <div>Cargando...</div>;

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleEditClick = (vacancie) => {
    setCurrentVacancie(vacancie);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowEditForm(false);
  };

  return (
    <LayoutAdmin>
      <h1 className="text-xl font-bold mb-6">Vacantes</h1>
      <div className="flex justify-between p-4">
        <div className="w-1/2"></div>
        <div className="w-1/6 flex items-end">
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
            <th>Estado</th>
            <th>Categoría</th>
            <th>Título</th>
            {showCompanyColumn && <th>Compañía</th>} {/* Mostrar la columna "Compañía" si es techpech */}
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Requisitos</th>
            <th>Salario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((vacancie, index) => (
            <tr key={index} className="hover">
              <th>{vacancie.id}</th>
              <td>{vacancie.state}</td>
              <td>{vacancie.category}</td>
              <td>{vacancie.title}</td>
              {showCompanyColumn && (
                <td>{vacancie.company_name}</td>
              )}
              <td>{vacancie.description}</td>
              <td>{vacancie.type}</td>
              <td>{vacancie.requirements}</td>
              <td>{vacancie.salary}</td>
              <td>
                <ButtonTable id={vacancie.id} mutate={mutate} onEdit={() => handleEditClick(vacancie)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <PopupInsert onClose={handleCloseForm} mutate={mutate} canEdit={canEdit} companyID={companyID} />}
      {showEditForm && <PopupEdit onClose={handleCloseForm} mutate={mutate} vacancie={currentVacancie} canEdit={canEdit} companyID={companyID} />}

    </LayoutAdmin>
  );
}

export default Vacanciedata;