import { useRef, useState, useEffect } from "react";
import TableauSalles from "../components/TableauSalles";
import TableauEffectif from "../components/TableauEffectif";
import TableauRepartition from "../components/TableauRepartition";
import TableauResultats from "../components/TableauResultats";
import useSpecialties from "../components/useSpecialties";
import { generatePDF } from "../components/generatePDF";
import {
  calculerHeuresRestantes,
  calculerApprenantsPossibles,
  determinerEtat,
} from "../utils/calculs";

// دالة لحساب النسبة لكل سطر
function calculerPourcentageLigne(heuresRestantes, heuresDisponibles, etat) {
  if (!heuresDisponibles || isNaN(heuresRestantes)) return "";
  const percent = Math.abs(Math.round((heuresRestantes / heuresDisponibles) * 100));
  return etat === "Excédent" ? `+${percent}%` : `-${percent}%`;
}

const moyenne = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const somme = arr => arr.reduce((a, b) => a + b, 0);
const defaultSalle = (cno, semaines, heures) => ({
  surface: "",
  cno,
  semaines,
  heures,
  surfaceP: 0,
  heuresMax: Math.round(semaines * heures),
});

export default function TDA() {
  const pdfRef = useRef();
  // أضف tp2 وtp3 في كل الحالات الافتراضية
  const [salles, setSalles] = useState({
    theorie: [defaultSalle(1.0, 72, 56)],
    pratique: [defaultSalle(1.0, 72, 56)],
    tpSpecifiques: [defaultSalle(1.0, 72, 56)],
    tp2: [defaultSalle(1.0, 72, 56)],
    tp3: [defaultSalle(1.0, 72, 56)],
  });
  const [cnos, setCnos] = useState({
    theorie: 1.0,
    pratique: 1.0,
    tpSpecifiques: 1.0,
    tp2: 1.0,
    tp3: 1.0,
  });
  const [semaines, setSemaines] = useState({
    theorie: 72,
    pratique: 72,
    tpSpecifiques: 72,
    tp2: 72,
    tp3: 72,
  });
  const [heures, setHeures] = useState({
    theorie: 56,
    pratique: 56,
    tpSpecifiques: 56,
    tp2: 56,
    tp3: 56,
  });
  const [apprenants, setApprenants] = useState({
    theorie: 26,
    pratique: 26,
    tpSpecifiques: 26,
    tp2: 26,
    tp3: 26,
  });
  const [effectif, setEffectif] = useState([{ specialite: "", groupes: 0, apprenants: 0 }]);
  const [repartition, setRepartition] = useState({
    besoinTheoTotal: 0,
    besoinPratTotal: 0,
    besoinTpSpecTotal: 0,
    besoinTp2Total: 0,
    besoinTp3Total: 0,
    moyenneTheo: 0,
    moyennePrat: 0,
    moyenneTpSpec: 0,
    moyenneTp2: 0,
    moyenneTp3: 0,
  });

  const specialties = useSpecialties();

  useEffect(() => {
    const saved = localStorage.getItem("tdaData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSalles({
        theorie: parsed.salles?.theorie || [defaultSalle(1.0, 72, 56)],
        pratique: parsed.salles?.pratique || [defaultSalle(1.0, 72, 56)],
        tpSpecifiques: parsed.salles?.tpSpecifiques || [defaultSalle(1.0, 72, 56)],
        tp2: parsed.salles?.tp2 || [defaultSalle(1.0, 72, 56)],
        tp3: parsed.salles?.tp3 || [defaultSalle(1.0, 72, 56)],
      });
      setEffectif(parsed.effectif || [{ specialite: "", groupes: 0, apprenants: 0 }]);
      setRepartition({
        besoinTheoTotal: parsed.repartition?.besoinTheoTotal ?? 0,
        besoinPratTotal: parsed.repartition?.besoinPratTotal ?? 0,
        besoinTpSpecTotal: parsed.repartition?.besoinTpSpecTotal ?? 0,
        besoinTp2Total: parsed.repartition?.besoinTp2Total ?? 0,
        besoinTp3Total: parsed.repartition?.besoinTp3Total ?? 0,
        moyenneTheo: parsed.repartition?.moyenneTheo ?? 0,
        moyennePrat: parsed.repartition?.moyennePrat ?? 0,
        moyenneTpSpec: parsed.repartition?.moyenneTpSpec ?? 0,
        moyenneTp2: parsed.repartition?.moyenneTp2 ?? 0,
        moyenneTp3: parsed.repartition?.moyenneTp3 ?? 0,
      });
    }
  }, []);

  const totalHeuresTheo = somme(salles.theorie.map(s => Number(s.heuresMax) || 0));
  const totalHeuresPrat = somme(salles.pratique.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTpSpec = somme(salles.tpSpecifiques.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTp2 = somme(salles.tp2.map(s => Number(s.heuresMax) || 0));
  const totalHeuresTp3 = somme(salles.tp3.map(s => Number(s.heuresMax) || 0));
  const moyenneSurfaceTheo = moyenne(salles.theorie.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfacePrat = moyenne(salles.pratique.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTpSpec = moyenne(salles.tpSpecifiques.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTp2 = moyenne(salles.tp2.map(s => Number(s.surfaceP) || 0));
  const moyenneSurfaceTp3 = moyenne(salles.tp3.map(s => Number(s.surfaceP) || 0));

  const heuresRestantesTheo = calculerHeuresRestantes(totalHeuresTheo, repartition.besoinTheoTotal);
  const heuresRestantesPrat = calculerHeuresRestantes(totalHeuresPrat, repartition.besoinPratTotal);
  const heuresRestantesTpSpec = calculerHeuresRestantes(totalHeuresTpSpec, repartition.besoinTpSpecTotal);
  const heuresRestantesTp2 = calculerHeuresRestantes(totalHeuresTp2, repartition.besoinTp2Total);
  const heuresRestantesTp3 = calculerHeuresRestantes(totalHeuresTp3, repartition.besoinTp3Total);

  const apprenantsPossiblesTheo = calculerApprenantsPossibles(
    heuresRestantesTheo, repartition.moyenneTheo, moyenneSurfaceTheo
  );
  const apprenantsPossiblesPrat = calculerApprenantsPossibles(
    heuresRestantesPrat, repartition.moyennePrat, moyenneSurfacePrat
  );
  const apprenantsPossiblesTpSpec = calculerApprenantsPossibles(
    heuresRestantesTpSpec, repartition.moyenneTpSpec, moyenneSurfaceTpSpec
  );
  const apprenantsPossiblesTp2 = calculerApprenantsPossibles(
    heuresRestantesTp2, repartition.moyenneTp2, moyenneSurfaceTp2
  );
  const apprenantsPossiblesTp3 = calculerApprenantsPossibles(
    heuresRestantesTp3, repartition.moyenneTp3, moyenneSurfaceTp3
  );

  const etatTheo = determinerEtat(heuresRestantesTheo);
  const etatPrat = determinerEtat(heuresRestantesPrat);
  const etatTpSpec = determinerEtat(heuresRestantesTpSpec);
  const etatTp2 = determinerEtat(heuresRestantesTp2);
  const etatTp3 = determinerEtat(heuresRestantesTp3);

  const testGlobal =
    [etatTheo, etatPrat, etatTpSpec, etatTp2, etatTp3].every(e => e === 'Excédent')
      ? 'Excédent'
      : 'Dépassement';

  // حساب النسبة لكل سطر
  const percentTheo = calculerPourcentageLigne(heuresRestantesTheo, totalHeuresTheo, etatTheo);
  const percentPrat = calculerPourcentageLigne(heuresRestantesPrat, totalHeuresPrat, etatPrat);
  const percentTpSpec = calculerPourcentageLigne(heuresRestantesTpSpec, totalHeuresTpSpec, etatTpSpec);
  const percentTp2 = calculerPourcentageLigne(heuresRestantesTp2, totalHeuresTp2, etatTp2);
  const percentTp3 = calculerPourcentageLigne(heuresRestantesTp3, totalHeuresTp3, etatTp3);

  // Résultat Global: الأقل (الأكثر سلبية)
  const percentValues = [percentTheo, percentPrat, percentTpSpec, percentTp2, percentTp3]
    .filter(p => p !== "")
    .map(p => Number(p.replace('%','').replace('+','').replace('-','')));
  let percentGlobal = "";
  if (percentValues.length) {
    const min = Math.min(...percentValues);
    percentGlobal = (testGlobal === "Excédent" ? "+" : "-") + Math.abs(min) + "%";
  }

  const resultatsData = {
    totalHeuresTheo,
    totalHeuresPrat,
    totalHeuresTpSpec,
    totalHeuresTp2,
    totalHeuresTp3,
    besoinTheoTotal: repartition.besoinTheoTotal,
    besoinPratTotal: repartition.besoinPratTotal,
    besoinTpSpecTotal: repartition.besoinTpSpecTotal,
    besoinTp2Total: repartition.besoinTp2Total,
    besoinTp3Total: repartition.besoinTp3Total,
    moyenneBesoinTheo: repartition.moyenneTheo,
    moyenneBesoinPrat: repartition.moyennePrat,
    moyenneBesoinTpSpec: repartition.moyenneTpSpec,
    moyenneSurfaceTheo,
    moyenneSurfacePrat,
    moyenneSurfaceTpSpec,
    moyenneSurfaceTp2,
    moyenneSurfaceTp3,
    heuresRestantesTheo,
    heuresRestantesPrat,
    heuresRestantesTpSpec,
    heuresRestantesTp2,
    heuresRestantesTp3,
    apprenantsPossiblesTheo,
    apprenantsPossiblesPrat,
    apprenantsPossiblesTpSpec,
    apprenantsPossiblesTp2,
    apprenantsPossiblesTp3,
    etatTheo,
    etatPrat,
    etatTpSpec,
    etatTp2,
    etatTp3,
    testGlobal
  };

  const resultatsRows = [];
  if (moyenneSurfaceTheo > 0)
    resultatsRows.push([
      "Théorique",
      isNaN(heuresRestantesTheo) ? 0 : heuresRestantesTheo,
      isNaN(apprenantsPossiblesTheo) ? 0 : apprenantsPossiblesTheo,
      etatTheo,
      percentTheo
    ]);
  if (moyenneSurfacePrat > 0)
    resultatsRows.push([
      "Pratique",
      isNaN(heuresRestantesPrat) ? 0 : heuresRestantesPrat,
      isNaN(apprenantsPossiblesPrat) ? 0 : apprenantsPossiblesPrat,
      etatPrat,
      percentPrat
    ]);
  if (moyenneSurfaceTpSpec > 0)
    resultatsRows.push([
      "TP Spécifiques",
      isNaN(heuresRestantesTpSpec) ? 0 : heuresRestantesTpSpec,
      isNaN(apprenantsPossiblesTpSpec) ? 0 : apprenantsPossiblesTpSpec,
      etatTpSpec,
      percentTpSpec
    ]);
  if (moyenneSurfaceTp2 > 0)
    resultatsRows.push([
      "TP2",
      isNaN(heuresRestantesTp2) ? 0 : heuresRestantesTp2,
      isNaN(apprenantsPossiblesTp2) ? 0 : apprenantsPossiblesTp2,
      etatTp2,
      percentTp2
    ]);
  if (moyenneSurfaceTp3 > 0)
    resultatsRows.push([
      "TP3",
      isNaN(heuresRestantesTp3) ? 0 : heuresRestantesTp3,
      isNaN(apprenantsPossiblesTp3) ? 0 : apprenantsPossiblesTp3,
      etatTp3,
      percentTp3
    ]);
  // Résultat Global: صف خاص بcolSpan = 3 مع النسبة
  resultatsRows.push([
    { value: "Résultat Global", colSpan: 3 },
    testGlobal,
    percentGlobal
  ]);
  const resultatsTable = {
    columns: ["Type", "Heures restantes", "Apprenants possibles", "État", "Niveau"],
    rows: resultatsRows
  };

  // فلترة synthèse des salles فقط
  const sallesSummaryRaw = [
    ["Théorie", salles.theorie.length, moyenneSurfaceTheo.toFixed(2), totalHeuresTheo],
    ["Pratique", salles.pratique.length, moyenneSurfacePrat.toFixed(2), totalHeuresPrat],
    ["TP Spécifiques", salles.tpSpecifiques.length, moyenneSurfaceTpSpec.toFixed(2), totalHeuresTpSpec],
    ["TP2", salles.tp2.length, moyenneSurfaceTp2.toFixed(2), totalHeuresTp2],
    ["TP3", salles.tp3.length, moyenneSurfaceTp3.toFixed(2), totalHeuresTp3],
  ];
  const sallesSummary = sallesSummaryRaw.filter(row => Number(row[2]) > 0);

  const totalGroupes = somme(effectif.map(e => Number(e.groupes) || 0));
  const totalApprenants = somme(effectif.map(e => Number(e.apprenants) || 0));
  const apprenantsSummary = [
    ...effectif.map(e => [e.specialite, e.groupes, e.apprenants, (Number(e.groupes) || 0) + (Number(e.apprenants) || 0)]),
    ["Total", totalGroupes, totalApprenants, totalGroupes + totalApprenants]
  ];

  const handleEffectifChange = (rows) => {
    setEffectif(rows.length ? rows : [{ specialite: "", groupes: 0, apprenants: 0 }]);
  };

  const handleRepartitionChange = (repData) => {
    const r = Array.isArray(repData) && repData.length > 0 ? repData[0] : {};
    setRepartition({
      besoinTheoTotal: r.besoinTheorieTotal ?? 0,
      besoinPratTotal: r.besoinInfoTotal ?? 0,
      besoinTpSpecTotal: r.besoinTP1Total ?? 0,
      besoinTp2Total: r.besoinTP2Total ?? 0,
      besoinTp3Total: r.besoinTP3Total ?? 0,
      // ... المتوسطات إذا احتجت