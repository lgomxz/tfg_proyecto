export interface Label {
  id: string;
  shortId: string;
  auricular_face_ridges_and_grooves: string;
  auricular_face_irregular_pososity?: string;
  upper_symphyseal_extremity_definition: string;
  upper_symphyseal_extremity_bony_nodule: string;
  lower_symphyseal_extremity_definition: string;
  dorsal_groove_definition: string;
  dorsal_groove_dorsal_plateau: string;
  ventral_margin_ventral_bevel: string;
  ventral_margin_ventral_margin: string;
  observationsField: string;
  toddPhasePractitioner: string;
}
export interface LabelWitPubis {
  auricular_face_ridges_and_grooves: string;
  auricular_face_irregular_pososity?: string;
  upper_symphyseal_extremity_definition: string;
  upper_symphyseal_extremity_bony_nodule: string;
  lower_symphyseal_extremity_definition: string;
  dorsal_groove_definition: string;
  ventral_margin_ventral_bevel: string;
  ventral_margin_ventral_margin: string;
  observationsField: string;
  toddPhasePractitioner: string;
  score?: number;
  pubisId: string | undefined;
  userId: string | undefined;
}
