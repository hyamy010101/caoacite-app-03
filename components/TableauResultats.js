import {
  calculerHeuresRestantes,
  determinerEtat,
} from '../utils/calculs';

export default function TableauResultats({ data }) {
  const {
    totalHeuresTheo,
    totalHeuresPrat,
    totalHeuresTpSpec,
    totalHeuresTp2,
    totalHeuresTp3,
    besoinTheoTotal,
    besoinPratTotal,
    besoinTpSpecTotal,
    besoinTp2Total,
    besoinTp3Total,
    moyenneSurfaceTheo,
    moyenneSurfacePrat,
    moyenneSurfaceTpSpec,
    moyenneSurfaceTp2,
    moyenneSurfaceTp3,
  } = data;

  const heuresRestantesTheo = calculerHeuresRestantes(totalHeuresTheo, besoinTheoTotal);
  const heuresRestantesPrat = calculerHeuresRestantes(totalHeuresPrat, besoinPratTotal);
  const heuresRestantesTpSpec = calculerHeuresRestantes(totalHeuresTpSpec, besoinTpSpecTotal);
  const heuresRestantesTp2 = calculerHeuresRestantes(totalHeuresTp2, besoinTp2Total);
  const heuresRestantesTp3 = calculerHeuresRestantes(totalHeuresTp3, besoinTp3Total);

  const etatTheo = determinerEtat(heuresRestantesTheo);
  const etatPrat = determinerEtat(heuresRestantesPrat);
  const etatTpSpec = determinerEtat(heuresRestantesTpSpec);
  const etatTp2 = determinerEtat(heuresRestantesTp2);
  const etatTp3 = determinerEtat(heuresRestantesTp3);

  // اجعل النتيجة العامة Excédent فقط إذا كل القاعات Excédent
  const testGlobal =
    [etatTheo, etatPrat, etatTpSpec, etatTp2, etatTp3].every(e => e === 'Excédent')
      ? 'Excédent'
      : 'Dépassement';
  const couleurGlobal = testGlobal === 'Excédent' ? 'text-green-600' : 'text-red-600';

  const rows = [];
  if (moyenneSurfaceTheo > 0) {
    rows.push({
      label: "Théorique",
      heures: isNaN(heuresRestantesTheo) ? 0 : heuresRestantesTheo,
      etat: etatTheo,
    });
  }
  if (moyenneSurfacePrat > 0) {
    rows.push({
      label: "Pratique",
      heures: isNaN(heuresRestantesPrat) ? 0 : heuresRestantesPrat,
      etat: etatPrat,
    });
  }
  if (moyenneSurfaceTpSpec > 0) {
    rows.push({
      label: "TP Spécifique",
      heures: isNaN(heuresRestantesTpSpec) ? 0 : heuresRestantesTpSpec,
      etat: etatTpSpec,
    });
  }
  if (moyenneSurfaceTp2 > 0) {
    rows.push({
      label: "TP2",
      heures: isNaN(heuresRestantesTp2) ? 0 : heuresRestantesTp2,
      etat: etatTp2,
    });
  }
  if (moyenneSurfaceTp3 > 0) {
    rows.push({
      label: "TP3",
      heures: isNaN(heuresRestantesTp3) ? 0 : heuresRestantesTp3,
      etat: etatTp3,
    });
  }

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-8">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Résultats</h2>
      <div className="table-responsive" style={{ width: "100%", overflowX: "auto" }}>
        <table className="table-compact">
          <thead>
            <tr>
              <th>Type</th>
              <th>Heures<br />restantes</th>
              <th>État</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ fontSize: "0.85rem" }}>{row.label}</td>
                <td className="text-center" style={{ fontSize: "0.85rem" }}>{row.heures}</td>
                <td className={`text-center font-semibold ${row.etat === 'Excédent' ? 'text-green-600' : 'text-red-600'}`} style={{ fontSize: "0.85rem" }}>
                  {row.etat}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="text-center" colSpan="2" style={{ fontSize: "0.85rem" }}>Résultat Global</td>
              <td className={`text-center ${couleurGlobal}`} style={{ fontSize: "0.85rem" }}>{testGlobal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}