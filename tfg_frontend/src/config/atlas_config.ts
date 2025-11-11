export interface AtlasConfigInfo {
  category: string;
  label: string;
  img1: string;
  img2: string;
  img3?: string;
  img4?: string;
  description: string;
}

export interface AtlasConfig {
  id: string;
  info: AtlasConfigInfo[];
}

export const atlasConfig: AtlasConfig[] = [
  {
    id: 'ArticularFace',
    info: [
      {
        category: 'Ridges and grooves',
        label: 'Regular porosity',
        img1: 'assets/img/atlas/auricular_face/ridges_and_grooves/regular_porosity1.PNG',
        img2: 'assets/img/atlas/auricular_face/ridges_and_grooves/regular_porosity2.PNG',
        description:
          'Ordered pores following well-defined directions (regardless of the presence or absence of grooves)',
      },
      {
        category: 'Ridges and grooves',
        label: 'Ridges and grooves',
        img1: 'assets/img/atlas/auricular_face/ridges_and_grooves/ridges_and_grooves1.PNG',
        img2: 'assets/img/atlas/auricular_face/ridges_and_grooves/ridges_and_grooves2.PNG',
        description: 'Very well defined ridges and grooves',
      },
      {
        category: 'Ridges and grooves',
        label: 'Grooves shallow',
        img1: 'assets/img/atlas/auricular_face/ridges_and_grooves/grooves_shallow1.PNG',
        img2: 'assets/img/atlas/auricular_face/ridges_and_grooves/grooves_shallow2.PNG',
        description:
          'Presence of ridges. In addition, the grooves are less defined (they are less deep)',
      },
      {
        category: 'Ridges and grooves',
        label: 'Grooves remains',
        img1: 'assets/img/atlas/auricular_face/ridges_and_grooves/grooves_remains1.PNG',
        img2: 'assets/img/atlas/auricular_face/ridges_and_grooves/grooves_remains2.PNG',
        description: 'Flat symphysis but with slight traces of some groove(s)',
      },
      {
        category: 'Ridges and grooves',
        label: 'No grooves',
        img1: 'assets/img/atlas/auricular_face/ridges_and_grooves/no_grooves1.PNG',
        img2: 'assets/img/atlas/auricular_face/ridges_and_grooves/no_grooves2.PNG',
        description: 'Completely flat articular face',
      },
    ],
  },
  {
    id: 'IrregularPorosity',
    info: [
      {
        category: 'Irregular porosity',
        label: 'Absence',
        img1: 'assets/img/atlas/auricular_face/irregular_porosity/absence1.PNG',
        img2: 'assets/img/atlas/auricular_face/irregular_porosity/absence2.PNG',
        description:
          'May be smooth, porous, ridged but not irregular porous',
      },
      {
        category: 'Irregular porosity',
        label: 'Medium',
        img1: 'assets/img/atlas/auricular_face/irregular_porosity/medium1.PNG',
        img2: 'assets/img/atlas/auricular_face/irregular_porosity/medium2.PNG',
        description: 'Non-homogeneous randomly distributed pores may appear',
      },
      {
        category: 'Irregular porosity',
        label: 'Much',
        img1: 'assets/img/atlas/auricular_face/irregular_porosity/much1.PNG',
        img2: 'assets/img/atlas/auricular_face/irregular_porosity/much2.PNG',
        description: 'Surface with pores of different sizes and irregularly distributed, without an established direction',
      },
    ],
  },
  {
    id: 'UpperSymphysialExtremity',
    info: [
      {
        category: 'Definition',
        label: 'Not especified',
        img1: 'assets/img/atlas/upper_symphysial_extremity/definition/not_specified1.PNG',
        img2: 'assets/img/atlas/upper_symphysial_extremity/definition/not_specified2.PNG',
        description:
          'There is no margin limiting the top edge. If there is any difference, it is marked by the texture',
      },
      {
        category: 'Definition',
        label: 'Defined',
        img1: 'assets/img/atlas/upper_symphysial_extremity/definition/defined1.PNG',
        img2: 'assets/img/atlas/upper_symphysial_extremity/definition/defined2.PNG',
        description:
          'The upper border is clearly defined',
      },
    ],
  },
  {
    id: 'BonyNodule',
    info: [
      {
        category: 'Bony nodule',
        label: 'Absent',
        img1: 'assets/img/atlas/upper_symphysial_extremity/bony_nodule/absent1.PNG',
        img2: 'assets/img/atlas/upper_symphysial_extremity/bony_nodule/absent2.PNG',
        description:
          'There is no bony nodule, regardless of wether there may be margin',
      },
      {
        category: 'Bony nodule',
        label: 'Present',
        img1: 'assets/img/atlas/upper_symphysial_extremity/bony_nodule/present1.PNG',
        img2: 'assets/img/atlas/upper_symphysial_extremity/bony_nodule/present2.PNG',
        description:
          'The bony nodule is clearly defined',
      },
    ],
  },
  {
    id: 'LowerSymphysialExtremity',
    info: [
      {
        category: 'Definition',
        label: 'Not especified',
        img1: 'assets/img/atlas/lower_symphysial_extremity/definition/not_specified1.PNG',
        img2: 'assets/img/atlas/lower_symphysial_extremity/definition/not_specified2.PNG',
        img3: 'assets/img/atlas/lower_symphysial_extremity/definition/not_specified3.PNG',
        img4: 'assets/img/atlas/lower_symphysial_extremity/definition/not_specified4.PNG',
        description:
          'There is margin limiting the bottom edge. If there is any difference it is marked by the texture',
      },
      {
        category: 'Definition',
        label: 'Defined', 
        img1: 'assets/img/atlas/lower_symphysial_extremity/definition/defined1.PNG',
        img2: 'assets/img/atlas/lower_symphysial_extremity/definition/defined2.PNG',
        description: 'The lower border is clearly defined',
      },
    ],
  },
  {
    id: 'DorsalMargin',
    info: [
      {
        category: 'Definition',
        label: 'Absent',
        img1: 'assets/img/atlas/dorsal_groove/definition/absent1.PNG',
        img2: 'assets/img/atlas/dorsal_groove/definition/absent2.PNG',
        description:
          'The ridges are in a higher plane than the dorsal border, but the dorsal channel is not yet defined',
      },
      {
        category: 'Definition',
        label: 'Present',
        img1: 'assets/img/atlas/dorsal_groove/definition/present1.PNG',
        img2: 'assets/img/atlas/dorsal_groove/definition/present2.PNG',
        description:
          'The dorsal groove occupies all or part of the dorsal margin',
      },
      {
        category: 'Definition',
        label: 'Closed',
        img1: 'assets/img/atlas/dorsal_groove/definition/closed1.PNG',
        img2: 'assets/img/atlas/dorsal_groove/definition/closed1.PNG',
        description:
          'Symphysial surface and dorsal margin are in the same plane closing the dorsal groove',
      },
    ],
  },
  {
    id: 'DorsalPlaeau',
    info: [
      {
        category: 'Dorsal plateau',
        label: 'Absent',
        img1: 'assets/img/atlas/dorsal_groove/dorsal_plateau/absent1.PNG',
        img2: 'assets/img/atlas/dorsal_groove/dorsal_plateau/absent2.PNG',
        description:
          'Making a vertical division of the symphysis, there is no significant difference in texture between both parts',
      },
      {
        category: 'Dorsal plateau',
        label: 'Present',
        img1: 'assets/img/atlas/dorsal_groove/dorsal_plateau/present1.PNG',
        img2: 'assets/img/atlas/dorsal_groove/dorsal_plateau/present2.PNG',
        description:
          'Making a vertical division of the symphysis, there is a significant difference in texture between both parts',
      }
    ],
  },
  {
    id: 'VentralBevel',
    info: [
      {
        category: 'Ventral bevel',
        label: 'Absent',
        img1: 'assets/img/atlas/ventral_margin/ventral_bevel/absent1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_bevel/absent2.PNG',
        description:
          'There is no elevation of the ventral area, regardless of the existence of margin',
      },
      {
        category: 'Ventral bevel',
        label: 'In process',
        img1: 'assets/img/atlas/ventral_margin/ventral_bevel/in_process1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_bevel/in_process2.PNG',
        description:
          'Part of the ventral border begins to rise',
      },
      {
        category: 'Ventral bevel',
        label: 'Present',
        img1: 'assets/img/atlas/ventral_margin/ventral_bevel/present1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_bevel/present2.PNG',
        description:
          'Significant elevation of the ventral edge creating a platform at a higher level',
      },
    ],
  },
  {
    id: 'VentralMargin',
    info: [
      {
        category: 'Ventral margin',
        label: 'Absent',
        img1: 'assets/img/atlas/ventral_margin/ventral_margin/absent1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_margin/absent2.PNG',
        description:
          'There is no margin limiting the ventral edge. If there is any difference, it is marked by the texture',
      },
      {
        category: 'Ventral margin',
        label: 'Partially formed',
        img1: 'assets/img/atlas/ventral_margin/ventral_margin/partially_formed1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_margin/partially_formed2.PNG',
        description:
          'Ventral edge in formation. There is usually an unformed part in the upper third',
      },
      {
        category: 'Ventral margin',
        label: 'Ventral edge formed without excrescences',
        img1: 'assets/img/atlas/ventral_margin/ventral_margin/without_excrescenses1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_margin/without_excrescenses2.PNG',
        description:
          'Ventral border fully formed',
      },
      {
        category: 'Ventral margin',
        label: 'Ventral edge formed with few excrescences',
        img1: 'assets/img/atlas/ventral_margin/ventral_margin/few_excrescenses1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_margin/few_excrescenses2.PNG',
        description:
          'Ventral edge fully formed with small irregularities (excrescences)',
      },
      {
        category: 'Ventral margin',
        label: 'Ventral edge formed with many excrescences',
        img1: 'assets/img/atlas/ventral_margin/ventral_margin/many_excrescenses1.PNG',
        img2: 'assets/img/atlas/ventral_margin/ventral_margin/many_excrescenses2.PNG',
        description:
          'Ventral edge fully formed with many irregularities', 
      },
    ],
  }
];