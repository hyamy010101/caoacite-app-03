import React, { useEffect } from "react";
import { calculerBesoinHoraireParSpecialite } from "../utils/calculs";

export default function TableauRepartition({ effectifData, specialties, onDataChange }) {
  const findSpecialtyData = (specialite) => {
    return specialties.find(s => s["Spécialité"] === specialite) || {};
  };

  const rows = effectifData.length > 0
    ? effectifData.map(row => ({
        ...row,
        groupes: Number(row.groupes) || 0,
        apprenants: Number(row.apprenants) || 0
      }))
    : [{ specialite: "", groupes: 0, apprenants: 0 }];

  // فقط حسابات par Spécialité (لا حاجة لحسابات par Groupe للعرض)
  const besoinTheoParSpecArr = rows.map(row => {
    const spec = findSpecialtyData(row.specialite);
    return calculerBesoinHoraireParSpecialite(row.groupes || 0, spec["Besoin Théorique par Groupe"] || 0);
  });
  const besoinPratParSpecArr = rows.map(row => {
    const spec = findSpecialtyData(row.specialite);
    return calculerBesoinHoraireParSpecialite(row.groupes || 0, spec["Besoin Pratique par Groupe"] || 0);
  });
  const besoinTpSpecParSpecArr = rows.map(row => {
    const spec = findSpecialtyData(row.specialite);
    return calculerBesoinHoraireParSpecialite(row.groupes || 0, spec["Besoin TP Spécifique par Groupe"] || 0);
  });

  const sumBesoinTheoParSpec = besoinTheoParSpecArr.reduce((a, b) => a + b, 0);
  const sumBesoinPratParSpec = besoinPratParSpecArr.reduce((a, b) => a + b, 0);
  const sumBesoinTpSpecParSpec = besoinTpSpecParSpecArr.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (onDataChange) {
      onDataChange([
        {
          besoinTheoTotal: sumBesoinTheoParSpec,
          besoinPratTotal: sumBesoinPratParSpec,
          besoinTpSpecTotal: sumBesoinTpSpecParSpec,
        }
      ]);
    }
  }, [
    sumBesoinTheoParSpec, sumBesoinPratParSpec, sumBesoinTpSpecParSpec,
    onDataChange
  ]);

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Répartition</h2>
      <div className="table-responsive" style={{ width: "100%", overflowX: "auto" }}>
        <table className="table-compact">
          <thead>
            <tr>
              <th>Spécialité</th>
              <th>Besoin Théorique<br />par Spécialité</th>
              <th>Besoin Pratique<br />par Spécialité</th>
              <th>Besoin TP Spécifique<br />par Spécialité</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const spec = findSpecialtyData(row.specialite);
              const besoinTheoParSpecialite = calculerBesoinHoraireParSpecialite(row.groupes || 0, spec["Besoin Théorique par Groupe"] || 0);
              const besoinPratParSpecialite = calculerBesoinHoraireParSpecialite(row.groupes || 0, spec["Besoin Pratique par Groupe"] || 0);
              const besoinTpSpecParSpecialite = calculerBesoinHoraireParSpecialite(row.groupes || 0, spec["Besoin TP Spécifique par Groupe"] || 0);

              return (
                <tr key={idx}>
                  <td style={{ fontSize: "0.85rem" }}>{row.specialite || ""}</td>
                  <td className="text-center" style={{ fontSize: "0.85rem" }}>{besoinTheoParSpecialite}</td>
                  <td className="text-center" style={{ fontSize: "0.85rem" }}>{besoinPratParSpecialite}</td>
                  <td className="text-center" style={{ fontSize: "0.85rem" }}>{besoinTpSpecParSpecialite}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="font-bold text-right" style={{ fontSize: "0.85rem" }}>Somme</td>
              <td className="text-center font-bold" style={{ fontSize: "0.85rem" }}>{sumBesoinTheoParSpec}</td>
              <td className="text-center font-bold" style={{ fontSize: "0.85rem" }}>{sumBesoinPratParSpec}</td>
              <td className="text-center font-bold" style={{ fontSize: "0.85rem" }}>{sumBesoinTpSpecParSpec}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}