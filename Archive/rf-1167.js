let scheme = {
	"schema": {
		"element": [
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "GenerellInformasjon-grp-1053",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "virksomheten-grp-5378",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "regnskapsforerRevisor-grp-5379",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TilleggsopplysningerOgSpesifikasjoner-grp-140",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Bruttofortjeneste-grp-146",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ForSamvirkelag-grp-4990",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattemessigVerdiPaFordringer-grp-148",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AretsAnskaffelserOgSalgAvDriftsmidler-grp-150",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatregnskapDriftsinntekter-grp-1992",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatregnskapDriftskostnader-grp-2013",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatregnskapFinans-grp-2014",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BalanseAnleggsmidler-grp-190",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BalanseOmlopsmidler-grp-2039",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BalanseEgenkapital-grp-2041",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BalanseLangsiktigGjeld-grp-2046",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BalanseKortsiktigGjeld-grp-2048",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "tilbakeforingNaringsinntekt-grp-6855",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "forAsDls-grp-7262",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "enkelpersonforetak-grp-6864",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "andrePoster-grp-7267",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "beregingNaringsinntekt-grp-6863",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordelingAvInntektPaNaring-grp-4956",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": [
						{
							"_fixed": "1",
							"_name": "skjemanummer",
							"_type": "xs:integer",
							"_use": "required",
							"__prefix": "xs"
						},
						{
							"_fixed": "12296",
							"_name": "spesifikasjonsnummer",
							"_type": "xs:integer",
							"_use": "required",
							"__prefix": "xs"
						},
						{
							"_fixed": "RF-1167",
							"_name": "blankettnummer",
							"_type": "xs:string",
							"_use": "optional",
							"__prefix": "xs"
						},
						{
							"_fixed": "Næringsoppgave 2 (for aksjeselskaper m.v.)",
							"_name": "tittel",
							"_type": "xs:string",
							"_use": "optional",
							"__prefix": "xs"
						},
						{
							"_fixed": "96",
							"_name": "gruppeid",
							"_type": "xs:positiveInteger",
							"_use": "optional",
							"__prefix": "xs"
						},
						{
							"simpleType": {
								"restriction": {
									"_base": "xs:string",
									"__prefix": "xs"
								},
								"__prefix": "xs"
							},
							"_default": "NoAgency",
							"_name": "etatid",
							"_use": "optional",
							"__prefix": "xs"
						}
					],
					"anyAttribute": {
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Skjema",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Avgiver-grp-138",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "HenvendelseRettesTil-grp-247",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1053",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GenerellInformasjon-grp-1053",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "EnhetNavn-datadef-1",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetAdresse-datadef-15",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetOrganisasjonsnummer-datadef-18",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OppgavegiverFodselsnummer-datadef-26",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetPostnummer-datadef-6673",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetPoststed-datadef-6674",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "138",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Avgiver-grp-138",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst175-repformat-8",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNavn-datadef-1",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "15",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst105-repformat-9",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetAdresse-datadef-15",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "18",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst99Modulus11-repformat-1",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetOrganisasjonsnummer-datadef-18",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "26",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst1111Modulus11-repformat-18",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OppgavegiverFodselsnummer-datadef-26",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6673",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst44BareTall-repformat-10",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetPostnummer-datadef-6673",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6674",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst35-repformat-3",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetPoststed-datadef-6674",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "KontaktpersonNavn-datadef-2",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontaktpersonTelefonnummer-datadef-3",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontaktpersonEPost-datadef-27688",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "247",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "HenvendelseRettesTil-grp-247",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst150-repformat-13",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontaktpersonNavn-datadef-2",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "3",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst13-repformat-12",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontaktpersonTelefonnummer-datadef-3",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "27688",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst45-repformat-150",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontaktpersonEPost-datadef-27688",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Regnskapsperiode-grp-3959",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetNaring-datadef-16",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Sysselsatte-datadef-30",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Regnskapsplikt-datadef-7194",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ArsregnskapRegnskapsregler-datadef-30784",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ValutaUtenlandsk-datadef-28020",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_maxOccurs": "10",
								"_ref": "typeValuta-grp-6778",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "5378",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "virksomheten-grp-5378",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "RegnskapStartdato-datadef-4166",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapAvslutningsdato-datadef-4167",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "3959",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Regnskapsperiode-grp-3959",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "4166",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Dato-repformat-5",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapStartdato-datadef-4166",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "4167",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Dato-repformat-5",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapAvslutningsdato-datadef-4167",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "16",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst3500-repformat-17",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNaring-datadef-16",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "30",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Heltall5-repformat-64",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Sysselsatte-datadef-30",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7194",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg2JaNei-repformat-4",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Regnskapsplikt-datadef-7194",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "30784",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg5Regnskapsregler-repformat-914",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ArsregnskapRegnskapsregler-datadef-30784",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28020",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg2JaNei-repformat-4",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ValutaUtenlandsk-datadef-28020",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "ValutaTypeSpesifisertValuta-datadef-28021",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "6778",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "typeValuta-grp-6778",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28021",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst35-repformat-3",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ValutaTypeSpesifisertValuta-datadef-28021",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Revisor-grp-248",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Regnskapsforer-grp-139",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "5379",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "regnskapsforerRevisor-grp-5379",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Revisjonsplikt-datadef-310",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RevisorOrganisasjonsnummer-datadef-1938",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RevisjonsselskapNavn-datadef-13035",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RevisorNavn-datadef-1937",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RevisorAdresse-datadef-2247",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RevisorPostnummer-datadef-11265",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RevisorPoststed-datadef-11266",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "248",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Revisor-grp-248",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "310",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg3Revisjonsplikt-repformat-1133",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Revisjonsplikt-datadef-310",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1938",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst99Modulus11-repformat-1",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RevisorOrganisasjonsnummer-datadef-1938",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "13035",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst35-repformat-3",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RevisjonsselskapNavn-datadef-13035",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1937",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst175-repformat-8",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RevisorNavn-datadef-1937",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2247",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst105-repformat-9",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RevisorAdresse-datadef-2247",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11265",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst44BareTall-repformat-10",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RevisorPostnummer-datadef-11265",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11266",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst35-repformat-3",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RevisorPoststed-datadef-11266",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsforingEkstern-datadef-11262",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsforerNavn-datadef-280",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsforerOrganisasjonsnummer-datadef-3651",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsforerAdresse-datadef-281",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsforerPostnummer-datadef-6678",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsforerPoststed-datadef-6679",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtfyllerNaringsoppgave-datadef-34867",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtfyllerOrganisasjonsnummer-datadef-34868",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtfyllerNavn-datadef-34869",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtfyllerPostnummer-datadef-34870",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtfyllerPoststed-datadef-34871",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "139",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Regnskapsforer-grp-139",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11262",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg2JaNei-repformat-4",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsforingEkstern-datadef-11262",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "280",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst175-repformat-8",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsforerNavn-datadef-280",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "3651",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst99Modulus11-repformat-1",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsforerOrganisasjonsnummer-datadef-3651",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "281",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst105-repformat-9",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsforerAdresse-datadef-281",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6678",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst44BareTall-repformat-10",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsforerPostnummer-datadef-6678",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6679",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst35-repformat-3",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsforerPoststed-datadef-6679",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "34867",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg3UtfyllerNaringsoppgave-repformat-1155",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtfyllerNaringsoppgave-datadef-34867",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "34868",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst99Modulus11-repformat-1",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtfyllerOrganisasjonsnummer-datadef-34868",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "34869",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst175-repformat-8",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtfyllerNavn-datadef-34869",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "34870",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst44BareTall-repformat-10",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtfyllerPostnummer-datadef-34870",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "34871",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst35-repformat-3",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtfyllerPoststed-datadef-34871",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "Varelager-grp-1954",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "140",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TilleggsopplysningerOgSpesifikasjoner-grp-140",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "SkattemessigVerdiDetteAr-grp-1955",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsmessigVerdiDetteAr-grp-1956",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattemessigVerdiFjoraret-grp-1957",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RegnskapsmessigVerdiFjoraret-grp-1958",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1954",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Varelager-grp-1954",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningRavarerHalvfabrikataSkattemessig-datadef-111",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningVarerIArbeidSkattemessig-datadef-112",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningFerdigEgentilvirkedeVarerSkattemessig-datadef-113",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningInnkjopteVarerVideresalgSkattemessig-datadef-114",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BuskapVerdiSluttstatus-datadef-9669",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningJordbrukEgetBruk-datadef-17165",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningSkattemessig-datadef-115",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1955",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattemessigVerdiDetteAr-grp-1955",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "111",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningRavarerHalvfabrikataSkattemessig-datadef-111",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "112",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningVarerIArbeidSkattemessig-datadef-112",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "113",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningFerdigEgentilvirkedeVarerSkattemessig-datadef-113",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "114",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningInnkjopteVarerVideresalgSkattemessig-datadef-114",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "9669",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BuskapVerdiSluttstatus-datadef-9669",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17165",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningJordbrukEgetBruk-datadef-17165",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "115",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningSkattemessig-datadef-115",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningRavarerHalvfabrikata-datadef-283",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningVarerIArbeid-datadef-284",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningFerdigEgentilvirkedeVarer-datadef-285",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningInnkjopteVarerVideresalg-datadef-286",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BuskapVerdiRegnskapsmessig-datadef-22510",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningJordbrukEgetBrukRegnskapsmessig-datadef-22512",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1956",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsmessigVerdiDetteAr-grp-1956",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "283",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningRavarerHalvfabrikata-datadef-283",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "284",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningVarerIArbeid-datadef-284",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "285",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningFerdigEgentilvirkedeVarer-datadef-285",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "286",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningInnkjopteVarerVideresalg-datadef-286",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22510",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BuskapVerdiRegnskapsmessig-datadef-22510",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22512",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningJordbrukEgetBrukRegnskapsmessig-datadef-22512",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningRavarerHalvfabrikataSkattemessigFjoraret-datadef-6926",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningVarerIArbeidSkattemessigFjoraret-datadef-6928",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningFerdigEgentilvirkedeVarerSkattemessigFjoraret-datadef-6930",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningInnkjopteVarerVideresalgSkattemessigFjoraret-datadef-6932",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BuskapVerdiApningsstatus-datadef-9670",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningJordbrukEgetBrukFjoraret-datadef-17166",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningSkattemessigFjoraret-datadef-6934",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1957",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattemessigVerdiFjoraret-grp-1957",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6926",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningRavarerHalvfabrikataSkattemessigFjoraret-datadef-6926",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6928",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningVarerIArbeidSkattemessigFjoraret-datadef-6928",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6930",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningFerdigEgentilvirkedeVarerSkattemessigFjoraret-datadef-6930",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6932",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningInnkjopteVarerVideresalgSkattemessigFjoraret-datadef-6932",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "9670",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BuskapVerdiApningsstatus-datadef-9670",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17166",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningJordbrukEgetBrukFjoraret-datadef-17166",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6934",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningSkattemessigFjoraret-datadef-6934",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningRavarerHalvfabrikataFjoraret-datadef-6927",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningVarerIArbeidFjoraret-datadef-6929",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningFerdigEgentilvirkedeVarerFjoraret-datadef-6931",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningInnkjopteVarerVideresalgFjoraret-datadef-6933",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BuskapVerdiRegnskapsmessigFjoraret-datadef-22511",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningJordbrukEgetBrukRegnskapsmessigFjoraret-datadef-22513",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1958",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RegnskapsmessigVerdiFjoraret-grp-1958",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6927",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningRavarerHalvfabrikataFjoraret-datadef-6927",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6929",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningVarerIArbeidFjoraret-datadef-6929",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6931",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningFerdigEgentilvirkedeVarerFjoraret-datadef-6931",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6933",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningInnkjopteVarerVideresalgFjoraret-datadef-6933",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22511",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BuskapVerdiRegnskapsmessigFjoraret-datadef-22511",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22513",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningJordbrukEgetBrukRegnskapsmessigFjoraret-datadef-22513",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "SalgsinntekterHandelsvarer-datadef-94",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VarekostnadHandelsvarer-datadef-102",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FortjenesteHandelsvarerBrutto-datadef-110",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "146",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Bruttofortjeneste-grp-146",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "94",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgsinntekterHandelsvarer-datadef-94",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "102",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VarekostnadHandelsvarer-datadef-102",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "110",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FortjenesteHandelsvarerBrutto-datadef-110",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "AndelskapitalFelleseidSamvirkeforetakAvsetningGrunnlag-datadef-22150",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "NaringsinntektSamvirkeforetakOmsetningMedlemmerEgetLag-datadef-22151",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "4990",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ForSamvirkelag-grp-4990",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22150",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AndelskapitalFelleseidSamvirkeforetakAvsetningGrunnlag-datadef-22150",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22151",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektSamvirkeforetakOmsetningMedlemmerEgetLag-datadef-22151",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Fordringer-grp-1962",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetNyetablering-datadef-6947",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "148",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattemessigVerdiPaFordringer-grp-148",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FordringerDetteAr-grp-1964",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerFjoraret-grp-1965",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1962",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Fordringer-grp-1962",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderPalydende-datadef-6941",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderTap-datadef-6940",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderNedskrivningSkattemessig-datadef-117",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgKreditt-datadef-6944",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderSkattemessig-datadef-118",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKonsernMv-datadef-7128",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerSkattemessig-datadef-287",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1964",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerDetteAr-grp-1964",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6941",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderPalydende-datadef-6941",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6940",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderTap-datadef-6940",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "117",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderNedskrivningSkattemessig-datadef-117",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6944",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgKreditt-datadef-6944",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "118",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderSkattemessig-datadef-118",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7128",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKonsernMv-datadef-7128",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "287",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerSkattemessig-datadef-287",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderPalydendeFjoraret-datadef-6938",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderTapFjoraret-datadef-6939",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderNedskrivningSkattemessigFjoraret-datadef-6942",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgKredittFjoraret-datadef-6943",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKunderSkattemessigFjoraret-datadef-6945",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKonsernMvFjoraret-datadef-6946",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerSkattemessigFjoraret-datadef-6922",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1965",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerFjoraret-grp-1965",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6938",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderPalydendeFjoraret-datadef-6938",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6939",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderTapFjoraret-datadef-6939",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6942",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderNedskrivningSkattemessigFjoraret-datadef-6942",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6943",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgKredittFjoraret-datadef-6943",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6945",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKunderSkattemessigFjoraret-datadef-6945",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6946",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKonsernMvFjoraret-datadef-6946",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6922",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerSkattemessigFjoraret-datadef-6922",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6947",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg2JaNei-repformat-4",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNyetablering-datadef-6947",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "Driftsmidler-grp-1989",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "150",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AretsAnskaffelserOgSalgAvDriftsmidler-grp-150",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Anskaffelser-grp-1990",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Salg-grp-1991",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1989",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Driftsmidler-grp-1989",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "EiendelerImmaterielleTilgang-datadef-2637",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TomterGrunnarealerTilgang-datadef-6950",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BoligerBoligtomterTilgang-datadef-6954",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1990",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Anskaffelser-grp-1990",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2637",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerImmaterielleTilgang-datadef-2637",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6950",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TomterGrunnarealerTilgang-datadef-6950",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6954",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BoligerBoligtomterTilgang-datadef-6954",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "EiendelerImmaterielleAvgang-datadef-2638",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TomterGrunnarealerAvgang-datadef-6951",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BoligerBoligtomterAvgang-datadef-6955",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1991",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Salg-grp-1991",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2638",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerImmaterielleAvgang-datadef-2638",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6951",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TomterGrunnarealerAvgang-datadef-6951",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6955",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BoligerBoligtomterAvgang-datadef-6955",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "Driftsinntekter-grp-157",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1992",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatregnskapDriftsinntekter-grp-1992",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterDetteAr-grp-1993",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterFjoraret-grp-159",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "157",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Driftsinntekter-grp-157",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "SalgsinntekterUttakAvgiftspliktig-datadef-6958",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgsinntekterUttakAvgiftsfri-datadef-6960",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgsinntekterUttakUtenforAvgiftsomrade-datadef-6962",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvgifterOffentligeSolgteVarer-datadef-120",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TilskuddOffentlige-datadef-371",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterUopptjentASMv-datadef-17368",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeieinntekterFastEiendom-datadef-99",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeieinntekterAndre-datadef-6967",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ProvisjonsinntekterASMv-datadef-19467",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringseiendomVerdiendring-datadef-23849",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerBiologiskVerdiendring-datadef-23851",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerImmaterielleAvgangGevinst-datadef-35181",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerFinansielleAvgangGevinst-datadef-35182",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterAndre-datadef-73",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Driftsinntekter-datadef-72",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1993",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterDetteAr-grp-1993",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6958",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgsinntekterUttakAvgiftspliktig-datadef-6958",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6960",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgsinntekterUttakAvgiftsfri-datadef-6960",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6962",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgsinntekterUttakUtenforAvgiftsomrade-datadef-6962",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "120",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvgifterOffentligeSolgteVarer-datadef-120",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "371",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TilskuddOffentlige-datadef-371",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17368",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterUopptjentASMv-datadef-17368",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "99",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeieinntekterFastEiendom-datadef-99",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6967",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeieinntekterAndre-datadef-6967",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19467",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ProvisjonsinntekterASMv-datadef-19467",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23849",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringseiendomVerdiendring-datadef-23849",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23851",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerBiologiskVerdiendring-datadef-23851",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35181",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerImmaterielleAvgangGevinst-datadef-35181",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35182",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerFinansielleAvgangGevinst-datadef-35182",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "73",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterAndre-datadef-73",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "72",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Driftsinntekter-datadef-72",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "SalgsinntekterUttakAvgiftspliktigFjoraret-datadef-6959",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgsinntekterUttakAvgiftsfriFjoraret-datadef-6961",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgsinntekterUttakUtenforAvgiftsomradeFjoraret-datadef-6963",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvgifterOffentligeSolgteVarerFjoraret-datadef-6964",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TilskuddOffentligeFjoraret-datadef-6965",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterUopptjentASMvFjoraret-datadef-17369",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeieinntekterFastEiendomFjoraret-datadef-6966",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeieinntekterAndreFjoraret-datadef-6968",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ProvisjonsinntekterFjoraret-datadef-6969",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringseiendomVerdiendringFjoraret-datadef-23850",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerBiologiskVerdiendringFjoraret-datadef-23852",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerImmaterielleAvgangGevinstFjoraret-datadef-35190",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerFinansielleAvgangGevinstFjoraret-datadef-35191",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterAndreFjoraret-datadef-6971",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterFjoraret-datadef-6972",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "159",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterFjoraret-grp-159",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6959",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgsinntekterUttakAvgiftspliktigFjoraret-datadef-6959",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6961",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgsinntekterUttakAvgiftsfriFjoraret-datadef-6961",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6963",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgsinntekterUttakUtenforAvgiftsomradeFjoraret-datadef-6963",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6964",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvgifterOffentligeSolgteVarerFjoraret-datadef-6964",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6965",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TilskuddOffentligeFjoraret-datadef-6965",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17369",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterUopptjentASMvFjoraret-datadef-17369",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6966",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeieinntekterFastEiendomFjoraret-datadef-6966",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6968",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeieinntekterAndreFjoraret-datadef-6968",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6969",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ProvisjonsinntekterFjoraret-datadef-6969",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23850",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringseiendomVerdiendringFjoraret-datadef-23850",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23852",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerBiologiskVerdiendringFjoraret-datadef-23852",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35190",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerImmaterielleAvgangGevinstFjoraret-datadef-35190",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35191",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerFinansielleAvgangGevinstFjoraret-datadef-35191",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6971",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterAndreFjoraret-datadef-6971",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6972",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterFjoraret-datadef-6972",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "Driftskostnader-grp-1995",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2013",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatregnskapDriftskostnader-grp-2013",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "DriftskostnaderDetteAr-grp-165",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftskostnaderFjoraret-grp-166",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1995",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Driftskostnader-grp-1995",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Varekostnad-datadef-101",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BeholdningsendringerVarerEgentilvirkede-datadef-6973",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Fremmedytelser-datadef-3209",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BeholdningsendringerAnleggsmidlerEgentilvirkede-datadef-6975",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Lonnskostnader-datadef-81",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GodtgjorelserAndreOppgavepliktig-datadef-6980",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Arbeidsgiveravgift-datadef-104",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PensjonskostnaderInnberetningspliktige-datadef-6983",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GodtgjorelserDeltakerlignedeSelskaper-datadef-309",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PersonalkostnaderAndre-datadef-288",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvskrivningerOrdinare-datadef-141",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerNedskrivning-datadef-142",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FraktTransportkostnaderSalg-datadef-6989",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnergiProduksjon-datadef-103",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeiekostnaderFastEiendom-datadef-126",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LysVarme-datadef-6995",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenovasjonRenholdMv-datadef-6993",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeiekostnaderDriftsmidler-datadef-128",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsmaterialerIkkeAktivert-datadef-129",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VedlikeholdReparasjonBygninger-datadef-11324",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VedlikeholdReparasjonAnnet-datadef-11325",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FremmedeTjenester-datadef-106",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontorkostnadTelefonMv-datadef-7001",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TransportmidlerDrivstoff-datadef-7015",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TransportmidlerVedlikeholdMv-datadef-7003",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TransportmidlerForsikringAvgifter-datadef-7005",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BilkostnaderPrivatBil-datadef-7353",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "NaringsbilPrivatBruk-datadef-11329",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ReiseDiettBilgodtgjorelseOppgavepliktig-datadef-7007",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ReiseDiettIkkeOppgavepliktig-datadef-7008",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ProvisjonskostnaderASMv-datadef-19466",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgReklame-datadef-7011",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Representasjon-datadef-7013",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontingenterGaver-datadef-138",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Forsikringspremier-datadef-837",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GarantiService-datadef-7020",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PatentLisensRoyalties-datadef-140",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftskostnaderAndre-datadef-82",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerTap-datadef-144",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerImmaterielleAvgangTap-datadef-35183",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerFinansielleAvgangTap-datadef-35184",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Driftskostnader-datadef-83",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Driftsresultat-datadef-146",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "165",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftskostnaderDetteAr-grp-165",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "101",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Varekostnad-datadef-101",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6973",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BeholdningsendringerVarerEgentilvirkede-datadef-6973",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "3209",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Fremmedytelser-datadef-3209",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6975",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BeholdningsendringerAnleggsmidlerEgentilvirkede-datadef-6975",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "81",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Lonnskostnader-datadef-81",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6980",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GodtgjorelserAndreOppgavepliktig-datadef-6980",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "104",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Arbeidsgiveravgift-datadef-104",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6983",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PensjonskostnaderInnberetningspliktige-datadef-6983",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "309",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GodtgjorelserDeltakerlignedeSelskaper-datadef-309",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "288",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PersonalkostnaderAndre-datadef-288",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "141",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvskrivningerOrdinare-datadef-141",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "142",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerNedskrivning-datadef-142",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6989",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FraktTransportkostnaderSalg-datadef-6989",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "103",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnergiProduksjon-datadef-103",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "126",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeiekostnaderFastEiendom-datadef-126",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6995",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LysVarme-datadef-6995",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6993",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenovasjonRenholdMv-datadef-6993",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "128",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeiekostnaderDriftsmidler-datadef-128",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "129",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsmaterialerIkkeAktivert-datadef-129",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11324",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VedlikeholdReparasjonBygninger-datadef-11324",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11325",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VedlikeholdReparasjonAnnet-datadef-11325",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "106",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FremmedeTjenester-datadef-106",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7001",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontorkostnadTelefonMv-datadef-7001",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7015",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TransportmidlerDrivstoff-datadef-7015",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7003",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TransportmidlerVedlikeholdMv-datadef-7003",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7005",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TransportmidlerForsikringAvgifter-datadef-7005",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7353",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BilkostnaderPrivatBil-datadef-7353",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11329",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsbilPrivatBruk-datadef-11329",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7007",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ReiseDiettBilgodtgjorelseOppgavepliktig-datadef-7007",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7008",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ReiseDiettIkkeOppgavepliktig-datadef-7008",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19466",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ProvisjonskostnaderASMv-datadef-19466",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7011",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgReklame-datadef-7011",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7013",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Representasjon-datadef-7013",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "138",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontingenterGaver-datadef-138",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "837",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Forsikringspremier-datadef-837",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7020",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GarantiService-datadef-7020",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "140",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PatentLisensRoyalties-datadef-140",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "82",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftskostnaderAndre-datadef-82",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "144",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerTap-datadef-144",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35183",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerImmaterielleAvgangTap-datadef-35183",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35184",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerFinansielleAvgangTap-datadef-35184",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "83",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Driftskostnader-datadef-83",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "146",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Driftsresultat-datadef-146",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "VarekostnadFjoraret-datadef-6977",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BeholdningsendringerVarerEgentilvirkedeFjoraret-datadef-6974",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FremmedytelserFjoraret-datadef-6978",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BeholdningsendringerAnleggsmidlerEgentilvirkedeFjoraret-datadef-6976",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LonnskostnaderFjoraret-datadef-6979",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GodtgjorelserAndreOppgavepliktigFjoraret-datadef-6981",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ArbeidsgiveravgiftFjoraret-datadef-6982",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PensjonskostnaderInnberetningspliktigeFjoraret-datadef-6984",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GodtgjorelserDeltakerlignedeSelskaperFjoraret-datadef-6985",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PersonalkostnaderAndreFjoraret-datadef-6986",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvskrivningerOrdinareFjoraret-datadef-6987",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerNedskrivningFjoraret-datadef-6988",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FraktTransportkostnaderSalgFjoraret-datadef-6990",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnergiProduksjonFjoraret-datadef-6991",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeiekostnaderFastEiendomFjoraret-datadef-6992",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LysVarmeFjoraret-datadef-6996",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenovasjonRenholdMvFjoraret-datadef-6994",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeiekostnaderDriftsmidlerFjoraret-datadef-6997",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsmaterialerIkkeAktivertFjoraret-datadef-6998",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VedlikeholdReparasjonBygningerFjoraret-datadef-11326",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VedlikeholdReparasjonAnnetFjoraret-datadef-11327",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FremmedeTjenesterFjoraret-datadef-7000",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontorkostnadTelefonMvFjoraret-datadef-7002",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TransportmidlerDrivstoffFjoraret-datadef-7016",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TransportmidlerVedlikeholdMvFjoraret-datadef-7004",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TransportmidlerForsikringAvgifterFjoraret-datadef-7006",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BilkostnaderPrivatBilFjoraret-datadef-11328",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "NaringsbilPrivatBrukFjoraret-datadef-11330",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ReiseDiettBilgodtgjorelseOppgavepliktigFjoraret-datadef-7017",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ReiseDiettIkkeOppgavepliktigFjoraret-datadef-7009",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ProvisjonskostnaderFjoraret-datadef-7010",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SalgReklameFjoraret-datadef-7012",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RepresentasjonFjoraret-datadef-7014",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontingenterGaverFjoraret-datadef-7018",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ForsikringspremierFjoraret-datadef-7019",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GarantiServiceFjoraret-datadef-7021",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PatentLisensRoyaltiesFjoraret-datadef-7022",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftskostnaderAndreFjoraret-datadef-7023",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerTapFjoraret-datadef-7025",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerImmaterielleAvgangTapFjoraret-datadef-35192",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerFinansielleAvgangTapFjoraret-datadef-35193",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftskostnaderFjoraret-datadef-7987",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsresultatFjoraret-datadef-7026",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "166",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftskostnaderFjoraret-grp-166",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6977",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VarekostnadFjoraret-datadef-6977",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6974",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BeholdningsendringerVarerEgentilvirkedeFjoraret-datadef-6974",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6978",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FremmedytelserFjoraret-datadef-6978",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6976",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BeholdningsendringerAnleggsmidlerEgentilvirkedeFjoraret-datadef-6976",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6979",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LonnskostnaderFjoraret-datadef-6979",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6981",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GodtgjorelserAndreOppgavepliktigFjoraret-datadef-6981",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6982",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ArbeidsgiveravgiftFjoraret-datadef-6982",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6984",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PensjonskostnaderInnberetningspliktigeFjoraret-datadef-6984",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6985",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GodtgjorelserDeltakerlignedeSelskaperFjoraret-datadef-6985",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6986",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PersonalkostnaderAndreFjoraret-datadef-6986",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6987",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvskrivningerOrdinareFjoraret-datadef-6987",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6988",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerNedskrivningFjoraret-datadef-6988",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6990",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FraktTransportkostnaderSalgFjoraret-datadef-6990",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6991",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnergiProduksjonFjoraret-datadef-6991",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6992",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeiekostnaderFastEiendomFjoraret-datadef-6992",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6996",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LysVarmeFjoraret-datadef-6996",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6994",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenovasjonRenholdMvFjoraret-datadef-6994",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6997",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeiekostnaderDriftsmidlerFjoraret-datadef-6997",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6998",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsmaterialerIkkeAktivertFjoraret-datadef-6998",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11326",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VedlikeholdReparasjonBygningerFjoraret-datadef-11326",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11327",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VedlikeholdReparasjonAnnetFjoraret-datadef-11327",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7000",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FremmedeTjenesterFjoraret-datadef-7000",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7002",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontorkostnadTelefonMvFjoraret-datadef-7002",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7016",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TransportmidlerDrivstoffFjoraret-datadef-7016",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7004",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TransportmidlerVedlikeholdMvFjoraret-datadef-7004",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7006",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TransportmidlerForsikringAvgifterFjoraret-datadef-7006",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11328",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BilkostnaderPrivatBilFjoraret-datadef-11328",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11330",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsbilPrivatBrukFjoraret-datadef-11330",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7017",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ReiseDiettBilgodtgjorelseOppgavepliktigFjoraret-datadef-7017",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7009",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ReiseDiettIkkeOppgavepliktigFjoraret-datadef-7009",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7010",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ProvisjonskostnaderFjoraret-datadef-7010",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7012",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SalgReklameFjoraret-datadef-7012",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7014",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RepresentasjonFjoraret-datadef-7014",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7018",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontingenterGaverFjoraret-datadef-7018",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7019",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ForsikringspremierFjoraret-datadef-7019",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7021",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GarantiServiceFjoraret-datadef-7021",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7022",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PatentLisensRoyaltiesFjoraret-datadef-7022",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7023",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftskostnaderAndreFjoraret-datadef-7023",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7025",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerTapFjoraret-datadef-7025",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35192",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerImmaterielleAvgangTapFjoraret-datadef-35192",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35193",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerFinansielleAvgangTapFjoraret-datadef-35193",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7987",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftskostnaderFjoraret-datadef-7987",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7026",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsresultatFjoraret-datadef-7026",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Finansinntekter-grp-1996",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Finanskostnader-grp-2008",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Arsresultat-grp-2016",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2014",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatregnskapFinans-grp-2014",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FinansinntekterDetteAr-grp-177",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinansinntekterFjoraret-grp-178",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "1996",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Finansinntekter-grp-1996",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "ResultatAndelPositiv-datadef-13956",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenteinntekterKonsern-datadef-149",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenteinntekterAndre-datadef-150",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ValutagevinstAgio-datadef-151",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerEgenkapitalbevisFondsandelerGevinst-datadef-35185",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinansinntektAnnen-datadef-35186",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerVerdiokning-datadef-7192",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektUtbytteAndreInvesteringer-datadef-24646",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Finansinntekter-datadef-153",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "177",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinansinntekterDetteAr-grp-177",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "13956",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatAndelPositiv-datadef-13956",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "149",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenteinntekterKonsern-datadef-149",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "150",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenteinntekterAndre-datadef-150",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "151",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ValutagevinstAgio-datadef-151",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35185",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerEgenkapitalbevisFondsandelerGevinst-datadef-35185",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35186",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinansinntektAnnen-datadef-35186",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7192",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerVerdiokning-datadef-7192",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "24646",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektUtbytteAndreInvesteringer-datadef-24646",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "153",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Finansinntekter-datadef-153",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "ResultatAndelPositivFjoraret-datadef-13957",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenteinntekterKonsernFjoraret-datadef-7029",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenteinntekterAndreFjoraret-datadef-7030",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ValutagevinstAgioFjoraret-datadef-7031",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerEgenkapitalbevisFondsandelerGevinstFjoraret-datadef-35194",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinansinntektAnnenFjoraret-datadef-35195",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerVerdiokningFjoraret-datadef-7676",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektUtbytteAndreInvesteringerFjoraret-datadef-24647",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinansinntekterFjoraret-datadef-7993",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "178",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinansinntekterFjoraret-grp-178",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "13957",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatAndelPositivFjoraret-datadef-13957",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7029",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenteinntekterKonsernFjoraret-datadef-7029",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7030",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenteinntekterAndreFjoraret-datadef-7030",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7031",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ValutagevinstAgioFjoraret-datadef-7031",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35194",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerEgenkapitalbevisFondsandelerGevinstFjoraret-datadef-35194",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35195",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinansinntektAnnenFjoraret-datadef-35195",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7676",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerVerdiokningFjoraret-datadef-7676",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "24647",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektUtbytteAndreInvesteringerFjoraret-datadef-24647",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7993",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinansinntekterFjoraret-datadef-7993",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FinanskostnaderDetteAr-grp-179",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinanskostnaderFjoraret-grp-180",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2008",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Finanskostnader-grp-2008",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "ResultatAndelNegativ-datadef-13958",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerVerdireduksjon-datadef-7189",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerFinansielleNedskrivning-datadef-7035",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RentekostnaderKonsern-datadef-7037",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RentekostnaderAndre-datadef-2216",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ValutatapDisagio-datadef-155",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerEgenkapitalbevisFondsandelerTap-datadef-35187",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinanskostnadAnnen-datadef-35188",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Finanskostnader-datadef-157",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "179",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinanskostnaderDetteAr-grp-179",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "13958",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatAndelNegativ-datadef-13958",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7189",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerVerdireduksjon-datadef-7189",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7035",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerFinansielleNedskrivning-datadef-7035",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7037",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RentekostnaderKonsern-datadef-7037",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2216",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RentekostnaderAndre-datadef-2216",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "155",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ValutatapDisagio-datadef-155",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35187",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerEgenkapitalbevisFondsandelerTap-datadef-35187",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35188",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinanskostnadAnnen-datadef-35188",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "157",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Finanskostnader-datadef-157",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "ResultatAndelNegativFjoraret-datadef-13959",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerVerdireduksjonFjoraret-datadef-7677",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerFinansielleNedskrivningFjoraret-datadef-7036",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RentekostnaderKonsernFjoraret-datadef-7038",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RentekostnaderAndreFjoraret-datadef-7039",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ValutatapDisagioFjoraret-datadef-7040",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerEgenkapitalbevisFondsandelerTapFjoraret-datadef-35196",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinanskostnadAnnenFjoraret-datadef-35197",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinanskostnaderFjoraret-datadef-7998",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "180",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinanskostnaderFjoraret-grp-180",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "13959",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatAndelNegativFjoraret-datadef-13959",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7677",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerVerdireduksjonFjoraret-datadef-7677",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7036",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerFinansielleNedskrivningFjoraret-datadef-7036",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7038",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RentekostnaderKonsernFjoraret-datadef-7038",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7039",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RentekostnaderAndreFjoraret-datadef-7039",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7040",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ValutatapDisagioFjoraret-datadef-7040",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35196",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerEgenkapitalbevisFondsandelerTapFjoraret-datadef-35196",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35197",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinanskostnadAnnenFjoraret-datadef-35197",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7998",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinanskostnaderFjoraret-datadef-7998",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "ArsresultatDetteAr-grp-2020",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ArsresultatFjoraret-grp-2021",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2016",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Arsresultat-grp-2016",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "ResultatForSkattekostnad-datadef-167",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarOrdinartResultat-datadef-7043",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattEndringUtsattOrdinartResultat-datadef-7046",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatOrdinart-datadef-7048",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntekterEkstraordinare-datadef-2195",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KostnaderEkstraordinare-datadef-2196",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarEkstraordinartResultat-datadef-7052",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattEndringUtsattEkstraordinartResultat-datadef-7057",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatkomponenterAndreIFRS-datadef-32929",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Arsresultat-datadef-172",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2020",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ArsresultatDetteAr-grp-2020",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "167",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatForSkattekostnad-datadef-167",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7043",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarOrdinartResultat-datadef-7043",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7046",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattEndringUtsattOrdinartResultat-datadef-7046",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7048",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatOrdinart-datadef-7048",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2195",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntekterEkstraordinare-datadef-2195",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2196",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KostnaderEkstraordinare-datadef-2196",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7052",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarEkstraordinartResultat-datadef-7052",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7057",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattEndringUtsattEkstraordinartResultat-datadef-7057",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32929",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatkomponenterAndreIFRS-datadef-32929",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "172",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Arsresultat-datadef-172",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "ResultatForSkattekostnadFjoraret-datadef-7042",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarOrdinartResultatFjoraret-datadef-7044",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattEndringUtsattOrdinartResultatFjoraret-datadef-7047",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatOrdinartFjoraret-datadef-7049",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntekterEkstraordinareFjoraret-datadef-7050",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KostnaderEkstraordinareFjoraret-datadef-7051",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarEkstraordinartResultatFjoraret-datadef-7053",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattEndringUtsattEkstraordinartResultatFjoraret-datadef-7058",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatkomponenterAndreIFRSFjoraret-datadef-32930",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ArsresultatFjoraret-datadef-7054",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2021",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ArsresultatFjoraret-grp-2021",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7042",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatForSkattekostnadFjoraret-datadef-7042",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7044",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarOrdinartResultatFjoraret-datadef-7044",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7047",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattEndringUtsattOrdinartResultatFjoraret-datadef-7047",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7049",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatOrdinartFjoraret-datadef-7049",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7050",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntekterEkstraordinareFjoraret-datadef-7050",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7051",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KostnaderEkstraordinareFjoraret-datadef-7051",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7053",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarEkstraordinartResultatFjoraret-datadef-7053",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7058",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattEndringUtsattEkstraordinartResultatFjoraret-datadef-7058",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32930",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatkomponenterAndreIFRSFjoraret-datadef-32930",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7054",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ArsresultatFjoraret-datadef-7054",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "Anleggsmidler-grp-2036",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "190",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BalanseAnleggsmidler-grp-190",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerDetteAr-grp-189",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerFjoraret-grp-2038",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2036",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Anleggsmidler-grp-2036",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FoU-datadef-7073",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PatenterRettigheter-datadef-205",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattefordelUtsatt-datadef-202",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ForretningsverdiGoodwill-datadef-206",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Forretningsbygg-datadef-1350",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ByggAnlegg-datadef-1344",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggKraftoverforing-datadef-17029",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InstallasjonFastTekniskBygning-datadef-32838",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggUnderUtforelse-datadef-212",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TomterGrunnarealer-datadef-214",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BoligerBoligtomter-datadef-215",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Investeringseiendom-datadef-23853",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PersonbilerTraktorerMaskinerMv-datadef-1347",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkipFartoyerRiggerMv-datadef-1348",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FlyHelikopter-datadef-1349",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VogntogLastebilerVarebilerMv-datadef-1346",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VarebilerMedNullutslipp-datadef-37289",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontormaskinerMv-datadef-1345",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsmidlerAndre-datadef-2836",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerDatterKonsernDeltakerlignet-datadef-7089",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerDatterKonsernAndre-datadef-7091",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtlanKonsern-datadef-6500",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerTilknyttetSelskapDeltakerlignet-datadef-7094",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerTilknyttetSelskapAndre-datadef-7096",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtlanTilknyttetSelskapFelleskontrollertVirksomhet-datadef-7098",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerAksjerAndeler-datadef-7100",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Obligasjoner-datadef-2363",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerLangsiktigEiereStyremedlemmerOl-datadef-7103",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAnsatte-datadef-7105",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAndre-datadef-79",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PensjonmidlerNetto-datadef-32931",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Anleggsmidler-datadef-217",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "189",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerDetteAr-grp-189",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7073",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FoU-datadef-7073",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "205",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PatenterRettigheter-datadef-205",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "202",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattefordelUtsatt-datadef-202",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "206",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ForretningsverdiGoodwill-datadef-206",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1350",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Forretningsbygg-datadef-1350",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1344",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ByggAnlegg-datadef-1344",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17029",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggKraftoverforing-datadef-17029",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32838",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InstallasjonFastTekniskBygning-datadef-32838",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "212",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggUnderUtforelse-datadef-212",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "214",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TomterGrunnarealer-datadef-214",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "215",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BoligerBoligtomter-datadef-215",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23853",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Investeringseiendom-datadef-23853",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1347",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PersonbilerTraktorerMaskinerMv-datadef-1347",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1348",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkipFartoyerRiggerMv-datadef-1348",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1349",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FlyHelikopter-datadef-1349",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1346",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VogntogLastebilerVarebilerMv-datadef-1346",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "37289",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VarebilerMedNullutslipp-datadef-37289",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1345",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontormaskinerMv-datadef-1345",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2836",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsmidlerAndre-datadef-2836",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7089",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerDatterKonsernDeltakerlignet-datadef-7089",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7091",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerDatterKonsernAndre-datadef-7091",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6500",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtlanKonsern-datadef-6500",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7094",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerTilknyttetSelskapDeltakerlignet-datadef-7094",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7096",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerTilknyttetSelskapAndre-datadef-7096",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7098",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtlanTilknyttetSelskapFelleskontrollertVirksomhet-datadef-7098",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7100",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerAksjerAndeler-datadef-7100",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2363",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Obligasjoner-datadef-2363",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7103",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerLangsiktigEiereStyremedlemmerOl-datadef-7103",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7105",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAnsatte-datadef-7105",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "79",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAndre-datadef-79",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32931",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PensjonmidlerNetto-datadef-32931",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "217",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Anleggsmidler-datadef-217",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FoUFjoraret-datadef-7074",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PatenterRettigheterFjoraret-datadef-7075",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattefordelUtsattFjoraret-datadef-7076",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ForretningsverdiGoodwillFjoraret-datadef-7077",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ForretningsbyggFjoraret-datadef-7078",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ByggAnleggFjoraret-datadef-7079",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggKraftoverforingFjoraret-datadef-17030",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InstallasjonFastTekniskBygningFjoraret-datadef-32839",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggUnderUtforelseFjoraret-datadef-7080",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TomterGrunnarealerFjoraret-datadef-7081",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BoligerBoligtomterFjoraret-datadef-7082",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringseiendomFjoraret-datadef-23854",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PersonbilerTraktorerMaskinerMvFjoraret-datadef-7083",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkipFartoyerRiggerMvFjoraret-datadef-7084",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FlyHelikopterFjoraret-datadef-7085",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VogntogLastebilerVarebilerMvFjoraret-datadef-7086",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VarebilerMedNullutslippFjoraret-datadef-37290",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontormaskinerMvFjoraret-datadef-7087",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsmidlerAndreFjoraret-datadef-7088",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerDatterKonsernDeltakerlignetFjoraret-datadef-7090",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerDatterKonsernAndreFjoraret-datadef-7092",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtlanKonsernFjoraret-datadef-7093",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerTilknyttetSelskapDeltakerlignetFjoraret-datadef-7095",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerTilknyttetSelskapAndreFjoraret-datadef-7097",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtlanTilknyttetSelskapFelleskontrollertVirksomhetFjoraret-datadef-7099",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InvesteringerAksjerAndelerFjoraret-datadef-7101",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ObligasjonerFjoraret-datadef-7102",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerLangsiktigEiereStyremedlemmerOlFjoraret-datadef-7104",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAnsatteFjoraret-datadef-7106",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAndreFjoraret-datadef-7107",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "PensjonmidlerNettoFjoraret-datadef-32932",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerFjoraret-datadef-7108",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2038",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerFjoraret-grp-2038",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7074",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FoUFjoraret-datadef-7074",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7075",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PatenterRettigheterFjoraret-datadef-7075",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7076",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattefordelUtsattFjoraret-datadef-7076",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7077",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ForretningsverdiGoodwillFjoraret-datadef-7077",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7078",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ForretningsbyggFjoraret-datadef-7078",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7079",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ByggAnleggFjoraret-datadef-7079",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17030",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggKraftoverforingFjoraret-datadef-17030",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32839",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InstallasjonFastTekniskBygningFjoraret-datadef-32839",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7080",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggUnderUtforelseFjoraret-datadef-7080",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7081",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TomterGrunnarealerFjoraret-datadef-7081",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7082",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BoligerBoligtomterFjoraret-datadef-7082",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23854",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringseiendomFjoraret-datadef-23854",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7083",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PersonbilerTraktorerMaskinerMvFjoraret-datadef-7083",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7084",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkipFartoyerRiggerMvFjoraret-datadef-7084",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7085",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FlyHelikopterFjoraret-datadef-7085",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7086",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VogntogLastebilerVarebilerMvFjoraret-datadef-7086",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "37290",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VarebilerMedNullutslippFjoraret-datadef-37290",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7087",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontormaskinerMvFjoraret-datadef-7087",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7088",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsmidlerAndreFjoraret-datadef-7088",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7090",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerDatterKonsernDeltakerlignetFjoraret-datadef-7090",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7092",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerDatterKonsernAndreFjoraret-datadef-7092",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7093",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtlanKonsernFjoraret-datadef-7093",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7095",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerTilknyttetSelskapDeltakerlignetFjoraret-datadef-7095",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7097",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerTilknyttetSelskapAndreFjoraret-datadef-7097",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7099",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtlanTilknyttetSelskapFelleskontrollertVirksomhetFjoraret-datadef-7099",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7101",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InvesteringerAksjerAndelerFjoraret-datadef-7101",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7102",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ObligasjonerFjoraret-datadef-7102",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7104",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerLangsiktigEiereStyremedlemmerOlFjoraret-datadef-7104",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7106",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAnsatteFjoraret-datadef-7106",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7107",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAndreFjoraret-datadef-7107",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32932",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PensjonmidlerNettoFjoraret-datadef-32932",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7108",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerFjoraret-datadef-7108",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "Omlopsmidler-grp-2040",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2039",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BalanseOmlopsmidler-grp-2039",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerDetteAr-grp-202",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerFjoraret-grp-203",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2040",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Omlopsmidler-grp-2040",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Lagerbeholdning-datadef-326",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerBiologisk-datadef-23855",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Kundefordringer-datadef-36573",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KundefordringerInnenforKonsern-datadef-36575",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterOpptjenteIkkeFakturerte-datadef-190",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAndreKonsern-datadef-7110",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKortsiktigEiereStyremedlemmerOl-datadef-19685",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAndreKortsiktig-datadef-282",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SelskapskapitalInnbetalingKrav-datadef-7113",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvIkkeMarkedsbaserte-datadef-7115",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvMarkedsbaserte-datadef-7117",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VerdipapirerMarkedsbaserte-datadef-7119",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VerdipapirerIkkeMarkedsbaserte-datadef-7121",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinansielleInstrumenterAndre-datadef-6429",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Kontanter-datadef-84",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Bankinnskudd-datadef-1189",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Omlopsmidler-datadef-194",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Eiendeler-datadef-219",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "202",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerDetteAr-grp-202",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "326",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Lagerbeholdning-datadef-326",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23855",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerBiologisk-datadef-23855",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "36573",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Kundefordringer-datadef-36573",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "36575",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KundefordringerInnenforKonsern-datadef-36575",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "190",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterOpptjenteIkkeFakturerte-datadef-190",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7110",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAndreKonsern-datadef-7110",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19685",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKortsiktigEiereStyremedlemmerOl-datadef-19685",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "282",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAndreKortsiktig-datadef-282",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7113",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SelskapskapitalInnbetalingKrav-datadef-7113",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7115",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvIkkeMarkedsbaserte-datadef-7115",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7117",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvMarkedsbaserte-datadef-7117",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7119",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VerdipapirerMarkedsbaserte-datadef-7119",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7121",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VerdipapirerIkkeMarkedsbaserte-datadef-7121",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6429",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinansielleInstrumenterAndre-datadef-6429",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "84",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Kontanter-datadef-84",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "1189",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Bankinnskudd-datadef-1189",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "194",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Omlopsmidler-datadef-194",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "219",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Eiendeler-datadef-219",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LagerbeholdningFjoraret-datadef-797",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerBiologiskFjoraret-datadef-23856",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KundefordringerFjoraret-datadef-36574",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KundefordringerInnenforKonsernFjoraret-datadef-36576",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DriftsinntekterOpptjenteIkkeFakturerteFjoraret-datadef-7109",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAndreKonsernFjoraret-datadef-7111",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerKortsiktigEiereStyremedlemmerOlFjoraret-datadef-19686",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordringerAndreKortsiktigFjoraret-datadef-7112",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SelskapskapitalInnbetalingKravFjoraret-datadef-7114",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvIkkeMarkedsbaserteFjoraret-datadef-7116",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvMarkedsbaserteFjoraret-datadef-7118",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VerdipapirerMarkedsbaserteFjoraret-datadef-7120",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "VerdipapirerIkkeMarkedsbaserteFjoraret-datadef-7122",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FinansielleInstrumenterAndreFjoraret-datadef-7123",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontanterFjoraret-datadef-7124",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "BankinnskuddFjoraret-datadef-7125",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerFjoraret-datadef-7126",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EiendelerFjoraret-datadef-7127",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "203",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerFjoraret-grp-203",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "797",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LagerbeholdningFjoraret-datadef-797",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23856",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerBiologiskFjoraret-datadef-23856",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "36574",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KundefordringerFjoraret-datadef-36574",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "36576",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KundefordringerInnenforKonsernFjoraret-datadef-36576",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7109",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DriftsinntekterOpptjenteIkkeFakturerteFjoraret-datadef-7109",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7111",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAndreKonsernFjoraret-datadef-7111",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19686",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerKortsiktigEiereStyremedlemmerOlFjoraret-datadef-19686",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7112",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordringerAndreKortsiktigFjoraret-datadef-7112",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7114",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SelskapskapitalInnbetalingKravFjoraret-datadef-7114",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7116",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvIkkeMarkedsbaserteFjoraret-datadef-7116",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7118",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvMarkedsbaserteFjoraret-datadef-7118",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7120",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VerdipapirerMarkedsbaserteFjoraret-datadef-7120",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7122",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "VerdipapirerIkkeMarkedsbaserteFjoraret-datadef-7122",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7123",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FinansielleInstrumenterAndreFjoraret-datadef-7123",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7124",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontanterFjoraret-datadef-7124",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7125",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BankinnskuddFjoraret-datadef-7125",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7126",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerFjoraret-datadef-7126",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7127",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EiendelerFjoraret-datadef-7127",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "InnskuttEgenkapital-grp-2042",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OpptjentEgenkapital-grp-2043",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2041",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BalanseEgenkapital-grp-2041",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "InnskuttEgenkapitalDetteAr-grp-222",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InnskuttEgenkapitalFjoraret-grp-223",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2042",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttEgenkapital-grp-2042",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "InnskuttEgenkapitalAksjekapitalEgenkapitalAndreForetak-datadef-19680",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InnskuttEgenkapitalEgneAksjerFelleseidAndelskapital-datadef-19682",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Overkursfond-datadef-2585",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InnskuttKapitalAnnen-datadef-9703",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "222",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttEgenkapitalDetteAr-grp-222",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19680",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttEgenkapitalAksjekapitalEgenkapitalAndreForetak-datadef-19680",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19682",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttEgenkapitalEgneAksjerFelleseidAndelskapital-datadef-19682",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2585",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Overkursfond-datadef-2585",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "9703",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttKapitalAnnen-datadef-9703",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "InnskuttEgenkapitalAksjekapitalEgenkapitalAndreForetakFjoraret-datadef-19681",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InnskuttEgenkapitalEgneAksjerFelleseidAndelskapitalFjoraret-datadef-19683",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OverkursfondFjoraret-datadef-7135",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InnskuttKapitalAnnenFjoraret-datadef-9983",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "223",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttEgenkapitalFjoraret-grp-223",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19681",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttEgenkapitalAksjekapitalEgenkapitalAndreForetakFjoraret-datadef-19681",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19683",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttEgenkapitalEgneAksjerFelleseidAndelskapitalFjoraret-datadef-19683",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7135",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OverkursfondFjoraret-datadef-7135",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "9983",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InnskuttKapitalAnnenFjoraret-datadef-9983",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "OpptjentEgenkapitalDetteAr-grp-2044",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OpptjentEgenkapitalFjoraret-grp-2045",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2043",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OpptjentEgenkapital-grp-2043",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FondVurderingsforskjeller-datadef-32933",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FondVerdiendringer-datadef-19898",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtbytteOpptjentEgenkapitalAvsattBelop-datadef-23857",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EgenkapitalAnnen-datadef-3274",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TapUdekket-datadef-249",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Egenkapital-datadef-250",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2044",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OpptjentEgenkapitalDetteAr-grp-2044",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32933",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FondVurderingsforskjeller-datadef-32933",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19898",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FondVerdiendringer-datadef-19898",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23857",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtbytteOpptjentEgenkapitalAvsattBelop-datadef-23857",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "3274",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EgenkapitalAnnen-datadef-3274",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "249",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TapUdekket-datadef-249",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "250",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Egenkapital-datadef-250",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "FondVurderingsforskjellerFjoraret-datadef-32934",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FondVerdiendringerFjoraret-datadef-19899",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtbytteOpptjentEgenkapitalAvsattBelopFjoraret-datadef-23858",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EgenkapitalAnnenFjoraret-datadef-7140",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TapUdekketFjoraret-datadef-7141",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EgenkapitalFjoraret-datadef-7142",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2045",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OpptjentEgenkapitalFjoraret-grp-2045",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "32934",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FondVurderingsforskjellerFjoraret-datadef-32934",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19899",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FondVerdiendringerFjoraret-datadef-19899",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23858",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtbytteOpptjentEgenkapitalAvsattBelopFjoraret-datadef-23858",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7140",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EgenkapitalAnnenFjoraret-datadef-7140",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7141",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TapUdekketFjoraret-datadef-7141",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7142",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EgenkapitalFjoraret-datadef-7142",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "LangsiktigGjeld-grp-2047",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2046",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BalanseLangsiktigGjeld-grp-2046",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LangsiktigGjeldDetteAr-grp-225",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LangsiktigGjeldFjoraret-grp-226",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2047",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LangsiktigGjeld-grp-2047",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "PensjonsforpliktelserASMv-datadef-17370",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattUtsatt-datadef-237",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Derivater-datadef-34565",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektUopptjentLangsiktig-datadef-7144",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvsetningerForpliktelserLangsiktig-datadef-7157",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LanKonvertibelLangsiktig-datadef-7147",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Obligasjonslan-datadef-6091",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKredittinstitusjoner-datadef-7150",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldLangsiktigAnsatteEiere-datadef-19687",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKonsernLangsiktig-datadef-2256",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "StilleInteressentinnskuddAnsvarligLanekapital-datadef-7153",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldAnnenLangsiktig-datadef-242",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldLangsiktig-datadef-86",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "225",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LangsiktigGjeldDetteAr-grp-225",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17370",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PensjonsforpliktelserASMv-datadef-17370",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "237",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattUtsatt-datadef-237",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "34565",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Derivater-datadef-34565",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7144",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektUopptjentLangsiktig-datadef-7144",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7157",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvsetningerForpliktelserLangsiktig-datadef-7157",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7147",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LanKonvertibelLangsiktig-datadef-7147",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6091",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Obligasjonslan-datadef-6091",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7150",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKredittinstitusjoner-datadef-7150",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19687",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldLangsiktigAnsatteEiere-datadef-19687",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2256",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKonsernLangsiktig-datadef-2256",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7153",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "StilleInteressentinnskuddAnsvarligLanekapital-datadef-7153",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "242",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldAnnenLangsiktig-datadef-242",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "86",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldLangsiktig-datadef-86",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "PensjonsforpliktelserASMvFjoraret-datadef-17371",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattUtsattFjoraret-datadef-7143",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DerivaterFjoraret-datadef-34566",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektUopptjentLangsiktigFjoraret-datadef-7145",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvsetningerForpliktelserLangsiktigFjoraret-datadef-7146",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LanKonvertibelLangsiktigFjoraret-datadef-7148",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ObligasjonslanFjoraret-datadef-7149",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKredittinstitusjonerFjoraret-datadef-7151",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldLangsiktigAnsatteEiereFjoraret-datadef-19688",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKonsernLangsiktigFjoraret-datadef-7152",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "StilleInteressentinnskuddAnsvarligLanekapitalFjoraret-datadef-7154",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldAnnenLangsiktigFjoraret-datadef-7155",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldLangsiktigFjoraret-datadef-7156",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "226",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LangsiktigGjeldFjoraret-grp-226",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "17371",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "PensjonsforpliktelserASMvFjoraret-datadef-17371",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7143",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattUtsattFjoraret-datadef-7143",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "34566",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DerivaterFjoraret-datadef-34566",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7145",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektUopptjentLangsiktigFjoraret-datadef-7145",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7146",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvsetningerForpliktelserLangsiktigFjoraret-datadef-7146",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7148",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LanKonvertibelLangsiktigFjoraret-datadef-7148",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7149",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ObligasjonslanFjoraret-datadef-7149",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7151",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKredittinstitusjonerFjoraret-datadef-7151",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19688",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldLangsiktigAnsatteEiereFjoraret-datadef-19688",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7152",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKonsernLangsiktigFjoraret-datadef-7152",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7154",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "StilleInteressentinnskuddAnsvarligLanekapitalFjoraret-datadef-7154",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7155",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldAnnenLangsiktigFjoraret-datadef-7155",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7156",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldLangsiktigFjoraret-datadef-7156",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "KortsiktigGjeld-grp-2049",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2048",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "BalanseKortsiktigGjeld-grp-2048",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "KortsiktigGjeldDetteAr-grp-234",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KortsiktigGjeldFjoraret-grp-235",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "2049",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KortsiktigGjeld-grp-2049",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LanKonvertibelKortsiktig-datadef-7158",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ObligasjonslanKortsiktig-datadef-23859",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DerivaterFinansielleKortsiktige-datadef-9835",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Kassekreditt-datadef-88",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Leverandorgjeld-datadef-220",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeverandorgjeldKonsern-datadef-13675",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarIkkeUtlignet-datadef-228",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarUtlignet-datadef-229",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattetrekkAndreTrekk-datadef-7166",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "MerverdiavgiftSkyldig-datadef-224",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ArbeidsgiveravgiftSkyldig-datadef-223",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvgifterOffentligeSkyldig-datadef-225",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtbytteAvsatt-datadef-235",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ForskuddKunder-datadef-231",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKortsiktigAnsatteEiere-datadef-7173",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKonsernKortsiktig-datadef-2255",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LonnFeriepengerMvSkyldig-datadef-226",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenterPalopt-datadef-227",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektUopptjentKortsiktig-datadef-7178",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvsetningerForpliktelserKortsiktig-datadef-7180",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldAnnenKortsiktig-datadef-236",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKortsiktig-datadef-85",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldEgenkapital-datadef-251",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "234",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KortsiktigGjeldDetteAr-grp-234",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7158",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LanKonvertibelKortsiktig-datadef-7158",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23859",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ObligasjonslanKortsiktig-datadef-23859",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "9835",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DerivaterFinansielleKortsiktige-datadef-9835",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "88",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Kassekreditt-datadef-88",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "220",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Leverandorgjeld-datadef-220",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "13675",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeverandorgjeldKonsern-datadef-13675",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "228",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarIkkeUtlignet-datadef-228",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "229",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarUtlignet-datadef-229",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7166",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattetrekkAndreTrekk-datadef-7166",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "224",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "MerverdiavgiftSkyldig-datadef-224",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "223",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ArbeidsgiveravgiftSkyldig-datadef-223",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "225",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvgifterOffentligeSkyldig-datadef-225",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "235",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtbytteAvsatt-datadef-235",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "231",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ForskuddKunder-datadef-231",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7173",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKortsiktigAnsatteEiere-datadef-7173",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2255",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKonsernKortsiktig-datadef-2255",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "226",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LonnFeriepengerMvSkyldig-datadef-226",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "227",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenterPalopt-datadef-227",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7178",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektUopptjentKortsiktig-datadef-7178",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7180",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvsetningerForpliktelserKortsiktig-datadef-7180",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "236",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldAnnenKortsiktig-datadef-236",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "85",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKortsiktig-datadef-85",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "251",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldEgenkapital-datadef-251",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "LanKonvertibelKortsiktigFjoraret-datadef-7159",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ObligasjonslanKortsiktigFjoraret-datadef-23860",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "DerivaterFinansielleKortsiktigeFjoraret-datadef-10015",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KassekredittFjoraret-datadef-7161",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeverandorgjeldFjoraret-datadef-7162",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LeverandorgjeldKonsernFjoraret-datadef-23861",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarIkkeUtlignetFjoraret-datadef-7163",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattBetalbarUtlignetFjoraret-datadef-7164",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattetrekkAndreTrekkFjoraret-datadef-7167",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "MerverdiavgiftSkyldigFjoraret-datadef-7168",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ArbeidsgiveravgiftSkyldigFjoraret-datadef-7169",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvgifterOffentligeSkyldigFjoraret-datadef-7170",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtbytteAvsattFjoraret-datadef-7171",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ForskuddKunderFjoraret-datadef-7172",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKortsiktigAnsatteEiereFjoraret-datadef-7174",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKonsernKortsiktigFjoraret-datadef-7175",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LonnFeriepengerMvSkyldigFjoraret-datadef-7176",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenterPaloptFjoraret-datadef-7177",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektUopptjentKortsiktigFjoraret-datadef-7179",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AvsetningerForpliktelserKortsiktigFjoraret-datadef-7181",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldAnnenKortsiktigFjoraret-datadef-7182",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldKortsiktigFjoraret-datadef-7183",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldEgenkapitalFjoraret-datadef-7185",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "235",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KortsiktigGjeldFjoraret-grp-235",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7159",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LanKonvertibelKortsiktigFjoraret-datadef-7159",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23860",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ObligasjonslanKortsiktigFjoraret-datadef-23860",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "10015",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "DerivaterFinansielleKortsiktigeFjoraret-datadef-10015",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7161",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KassekredittFjoraret-datadef-7161",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7162",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeverandorgjeldFjoraret-datadef-7162",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23861",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LeverandorgjeldKonsernFjoraret-datadef-23861",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7163",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarIkkeUtlignetFjoraret-datadef-7163",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7164",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattBetalbarUtlignetFjoraret-datadef-7164",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7167",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattetrekkAndreTrekkFjoraret-datadef-7167",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7168",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "MerverdiavgiftSkyldigFjoraret-datadef-7168",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7169",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ArbeidsgiveravgiftSkyldigFjoraret-datadef-7169",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7170",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvgifterOffentligeSkyldigFjoraret-datadef-7170",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7171",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtbytteAvsattFjoraret-datadef-7171",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7172",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ForskuddKunderFjoraret-datadef-7172",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7174",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKortsiktigAnsatteEiereFjoraret-datadef-7174",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7175",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKonsernKortsiktigFjoraret-datadef-7175",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7176",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LonnFeriepengerMvSkyldigFjoraret-datadef-7176",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7177",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenterPaloptFjoraret-datadef-7177",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7179",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektUopptjentKortsiktigFjoraret-datadef-7179",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7181",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AvsetningerForpliktelserKortsiktigFjoraret-datadef-7181",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7182",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldAnnenKortsiktigFjoraret-datadef-7182",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7183",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldKortsiktigFjoraret-datadef-7183",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7185",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldEgenkapitalFjoraret-datadef-7185",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Tillegg-grp-7293",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "fradrag-grp-6857",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "6855",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "tilbakeforingNaringsinntekt-grp-6855",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "RepresentasjonskostnaderKontingenterIkkeFradragsberettiget-datadef-27555",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KontigentIkkeFradragsberettiget-datadef-28171",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "Skattekostnad-datadef-171",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RentekostnaderSkattIkkeFradragsberettiget-datadef-256",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatAndelKostnadTilbakeforing-datadef-7187",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerVerdireduksjonTilbakefort-datadef-22516",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvNedskrivning-datadef-267",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvTap-datadef-263",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UnderskuddAndelDeltakerlignetSelskap-datadef-154",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AndelDeltakerlignetSelskapTap-datadef-271",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KostnaderAndreIkkeFradragsberettiget-datadef-258",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GjeldsrenterTilbakefortEtter2392Og691-datadef-35189",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "7293",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Tillegg-grp-7293",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "27555",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RepresentasjonskostnaderKontingenterIkkeFradragsberettiget-datadef-27555",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28171",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KontigentIkkeFradragsberettiget-datadef-28171",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "171",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Skattekostnad-datadef-171",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "256",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RentekostnaderSkattIkkeFradragsberettiget-datadef-256",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7187",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatAndelKostnadTilbakeforing-datadef-7187",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22516",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerVerdireduksjonTilbakefort-datadef-22516",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "267",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvNedskrivning-datadef-267",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "263",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvTap-datadef-263",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "154",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UnderskuddAndelDeltakerlignetSelskap-datadef-154",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "271",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AndelDeltakerlignetSelskapTap-datadef-271",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "258",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KostnaderAndreIkkeFradragsberettiget-datadef-258",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "35189",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GjeldsrenterTilbakefortEtter2392Og691-datadef-35189",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "AksjeutbytteSkattefritt-datadef-22302",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KonsernbidragResultatfort-datadef-22053",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattekostnadFradrag-datadef-28172",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "RenteinntekterSkatt-datadef-259",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatAndelInntektTilbakeforing-datadef-7191",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OmlopsmidlerVerdiokningTilbakefort-datadef-21017",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AnleggsmidlerNedskrivningReversering-datadef-5989",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvGevinst-datadef-264",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OverskuddAndelDeltakerlignetSelskap-datadef-148",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AndelDeltakerlignetSelskapGevinst-datadef-272",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntekterSkattefrieFradrag-datadef-28173",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "6857",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "fradrag-grp-6857",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22302",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjeutbytteSkattefritt-datadef-22302",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22053",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KonsernbidragResultatfort-datadef-22053",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28172",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattekostnadFradrag-datadef-28172",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "259",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenteinntekterSkatt-datadef-259",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7191",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatAndelInntektTilbakeforing-datadef-7191",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "21017",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OmlopsmidlerVerdiokningTilbakefort-datadef-21017",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "5989",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AnleggsmidlerNedskrivningReversering-datadef-5989",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "264",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvGevinst-datadef-264",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "148",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OverskuddAndelDeltakerlignetSelskap-datadef-148",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "272",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AndelDeltakerlignetSelskapGevinst-datadef-272",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28173",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntekterSkattefrieFradrag-datadef-28173",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Tillegg-grp-7294",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "fradrag-grp-6860",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "7262",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "forAsDls-grp-7262",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvGevinstSkatt-datadef-265",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AksjerUtbytteSkattepliktig-datadef-28176",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TilbakeforingFritaksmetoden3AvSkattefriInntektNaringsoppg2-datadef-31690",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "OverskuddAndelDeltakerlignetSelskapSkattemessig-datadef-269",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AndelDeltakerlignetSelskapGevinstSkattemessig-datadef-273",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "7294",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Tillegg-grp-7294",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "265",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvGevinstSkatt-datadef-265",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28176",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerUtbytteSkattepliktig-datadef-28176",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "31690",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TilbakeforingFritaksmetoden3AvSkattefriInntektNaringsoppg2-datadef-31690",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "269",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "OverskuddAndelDeltakerlignetSelskapSkattemessig-datadef-269",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "273",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AndelDeltakerlignetSelskapGevinstSkattemessig-datadef-273",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "AksjerMvTapSkatt-datadef-266",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UnderskuddAndelDeltakerlignetSelskapSkattemessig-datadef-270",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "AndelDeltakerlignetSelskapTapSkattemessig-datadef-274",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "6860",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "fradrag-grp-6860",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "266",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AksjerMvTapSkatt-datadef-266",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "270",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UnderskuddAndelDeltakerlignetSelskapSkattemessig-datadef-270",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "274",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "AndelDeltakerlignetSelskapTapSkattemessig-datadef-274",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "tillegg-grp-7292",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "fradrag-grp-6865",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "6864",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "enkelpersonforetak-grp-6864",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "Rentekostnader-datadef-91",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "7292",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "tillegg-grp-7292",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "91",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Rentekostnader-datadef-91",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "RenteinntekterLivsforsikring-datadef-275",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "LivsforsiktingAvkastning-datadef-28177",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SykepengerNaring-datadef-11331",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "6865",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "fradrag-grp-6865",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "275",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "RenteinntekterLivsforsikring-datadef-275",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28177",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "LivsforsiktingAvkastning-datadef-28177",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "11331",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SykepengerNaring-datadef-11331",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "Tillegg-grp-7295",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "fradrag-grp-7266",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "7267",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "andrePoster-grp-7267",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "InntektRegnskapsmessigSkattemessigEndringPositiv-datadef-28179",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "UtbytteEgenkapitalmetoden-datadef-7188",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "GevinstUttakEiendelerSkattepliktig-datadef-36577",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektTilleggPrivatkjoring-datadef-28180",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "InntektAnnen-datadef-13615",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "7295",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "Tillegg-grp-7295",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28179",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektRegnskapsmessigSkattemessigEndringPositiv-datadef-28179",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7188",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "UtbytteEgenkapitalmetoden-datadef-7188",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "36577",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "GevinstUttakEiendelerSkattepliktig-datadef-36577",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28180",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektTilleggPrivatkjoring-datadef-28180",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "13615",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektAnnen-datadef-13615",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "InntektRegnskapsmessigSkattemessigEndringNegativ-datadef-28178",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "TapUttakEiendelerFradragsberettiget-datadef-36578",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KostnaderEmisjonStiftelse-datadef-27556",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "NaringsinntektFradragAnnet-datadef-261",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "7266",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "fradrag-grp-7266",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "28178",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "InntektRegnskapsmessigSkattemessigEndringNegativ-datadef-28178",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "36578",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "TapUttakEiendelerFradragsberettiget-datadef-36578",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "27556",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KostnaderEmisjonStiftelse-datadef-27556",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "261",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektFradragAnnet-datadef-261",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "NaringsinntektTillegg-datadef-7190",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "NaringsinntektFradrag-datadef-2218",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "NaringsinntektGrunnlagPersoninntekt-datadef-22056",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "KjopsutbytteSamvirkeforetakAvsatt-datadef-276",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "NaringsinntektGrunnlagPersoninntekt-datadef-6675",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "6863",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "beregingNaringsinntekt-grp-6863",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "7190",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektTillegg-datadef-7190",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "2218",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektFradrag-datadef-2218",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "22056",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektGrunnlagPersoninntekt-datadef-22056",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "276",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "KjopsutbytteSamvirkeforetakAvsatt-datadef-276",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "6675",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektGrunnlagPersoninntekt-datadef-6675",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_maxOccurs": "10",
								"_ref": "FordelingPaNaringer-grp-4957",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "SkattepliktigNaringsinntekt-grp-4958",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordeltPaInnehaver-grp-4959",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "FordeltPaEktefelle-grp-4960",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "4956",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordelingAvInntektPaNaring-grp-4956",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": [
							{
								"_minOccurs": "0",
								"_ref": "EnhetNaringTypeSpesifisert-datadef-19811",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetNaringSpesifisertNaring-datadef-19890",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatFordelingSpesifisert-datadef-19791",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "ResultatSkogbrukReindriftKorreksjonerSpesifisert-datadef-19792",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetNaringsinntektSkattepliktigSpesifisert-datadef-19794",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetNaringNaringstypeOppgittISelvangivelse-datadef-23879",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetNaringsinntektSkattepliktigInnehaverSpesifisert-datadef-19795",
								"__prefix": "xs"
							},
							{
								"_minOccurs": "0",
								"_ref": "EnhetNaringsinntektSkattepliktigEktefelleMvSpesifisert-datadef-19796",
								"__prefix": "xs"
							}
						],
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "4957",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordelingPaNaringer-grp-4957",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19811",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst6-repformat-39",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNaringTypeSpesifisert-datadef-19811",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19890",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "Tekst35-repformat-3",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNaringSpesifisertNaring-datadef-19890",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19791",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatFordelingSpesifisert-datadef-19791",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19792",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "ResultatSkogbrukReindriftKorreksjonerSpesifisert-datadef-19792",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19794",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNaringsinntektSkattepliktigSpesifisert-datadef-19794",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "23879",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "KodelisteEttValg6TypeNaring-repformat-396",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNaringNaringstypeOppgittISelvangivelse-datadef-23879",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19795",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNaringsinntektSkattepliktigInnehaverSpesifisert-datadef-19795",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19796",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "EnhetNaringsinntektSkattepliktigEktefelleMvSpesifisert-datadef-19796",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "NaringsinntektSkattepliktig-datadef-19797",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "4958",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "SkattepliktigNaringsinntekt-grp-4958",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19797",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektSkattepliktig-datadef-19797",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "NaringsinntektSkattepliktigInnehaver-datadef-19798",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "4959",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordeltPaInnehaver-grp-4959",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19798",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektSkattepliktigInnehaver-datadef-19798",
				"_nillable": "true",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"sequence": {
						"element": {
							"_minOccurs": "0",
							"_ref": "NaringsinntektSkattepliktigEktefelleMv-datadef-19799",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"attribute": {
						"_fixed": "4960",
						"_name": "gruppeid",
						"_type": "xs:positiveInteger",
						"_use": "required",
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "FordeltPaEktefelle-grp-4960",
				"__prefix": "xs"
			},
			{
				"complexType": {
					"simpleContent": {
						"extension": {
							"attribute": {
								"_fixed": "19799",
								"_name": "orid",
								"_type": "xs:positiveInteger",
								"_use": "required",
								"__prefix": "xs"
							},
							"_base": "BelopHeltall15-repformat-37",
							"__prefix": "xs"
						},
						"__prefix": "xs"
					},
					"__prefix": "xs"
				},
				"_name": "NaringsinntektSkattepliktigEktefelleMv-datadef-19799",
				"_nillable": "true",
				"__prefix": "xs"
			}
		],
		"simpleType": [
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "175",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst175-repformat-8",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "105",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst105-repformat-9",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst99Modulus11-repformat-1",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst1111Modulus11-repformat-18",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst44BareTall-repformat-10",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "35",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst35-repformat-3",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "150",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst150-repformat-13",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "13",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst13-repformat-12",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "45",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst45-repformat-150",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"_base": "xs:date",
					"__prefix": "xs"
				},
				"_name": "Dato-repformat-5",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "3500",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst3500-repformat-17",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"totalDigits": {
						"_value": "5",
						"__prefix": "xs"
					},
					"_base": "xs:integer",
					"__prefix": "xs"
				},
				"_name": "Heltall5-repformat-64",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "3",
						"__prefix": "xs"
					},
					"enumeration": [
						{
							"_value": "Ja",
							"__prefix": "xs"
						},
						{
							"_value": "Nei",
							"__prefix": "xs"
						}
					],
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "KodelisteEttValg2JaNei-repformat-4",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "50",
						"__prefix": "xs"
					},
					"enumeration": [
						{
							"_value": "Regnskapslovens_alminnelige_regler",
							"__prefix": "xs"
						},
						{
							"_value": "IFRS",
							"__prefix": "xs"
						},
						{
							"_value": "Forenklet_IFRS",
							"__prefix": "xs"
						},
						{
							"_value": "Regnskapslovens_regler_for_sma_foretak",
							"__prefix": "xs"
						},
						{
							"_value": "God_regnskapsskikk_for_ideelle_organisasjoner",
							"__prefix": "xs"
						}
					],
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "KodelisteEttValg5Regnskapsregler-repformat-914",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "35",
						"__prefix": "xs"
					},
					"enumeration": [
						{
							"_value": "Ja",
							"__prefix": "xs"
						},
						{
							"_value": "Valgt_bort_revisjon",
							"__prefix": "xs"
						},
						{
							"_value": "Nei",
							"__prefix": "xs"
						}
					],
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "KodelisteEttValg3Revisjonsplikt-repformat-1133",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "35",
						"__prefix": "xs"
					},
					"enumeration": [
						{
							"_value": "Revisor",
							"__prefix": "xs"
						},
						{
							"_value": "Foretak",
							"__prefix": "xs"
						},
						{
							"_value": "Annen",
							"__prefix": "xs"
						}
					],
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "KodelisteEttValg3UtfyllerNaringsoppgave-repformat-1155",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"totalDigits": {
						"_value": "15",
						"__prefix": "xs"
					},
					"_base": "xs:integer",
					"__prefix": "xs"
				},
				"_name": "BelopHeltall15-repformat-37",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "6",
						"__prefix": "xs"
					},
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "Tekst6-repformat-39",
				"__prefix": "xs"
			},
			{
				"restriction": {
					"minLength": {
						"_value": "1",
						"__prefix": "xs"
					},
					"maxLength": {
						"_value": "50",
						"__prefix": "xs"
					},
					"enumeration": [
						{
							"_value": "Annen_naering",
							"__prefix": "xs"
						},
						{
							"_value": "Fiske_og_fangst",
							"__prefix": "xs"
						},
						{
							"_value": "Jordbruk_gartneri",
							"__prefix": "xs"
						},
						{
							"_value": "Reindrift",
							"__prefix": "xs"
						},
						{
							"_value": "Skiferproduksjon",
							"__prefix": "xs"
						},
						{
							"_value": "Skogbruk",
							"__prefix": "xs"
						},
						{
							"_value": "Inntekt_fra_familiebarnehager",
							"__prefix": "xs"
						}
					],
					"_base": "xs:string",
					"__prefix": "xs"
				},
				"_name": "KodelisteEttValg6TypeNaring-repformat-396",
				"__prefix": "xs"
			}
		],
		"_xmlns:brreg": "http://www.brreg.no/or",
		"_xmlns:xs": "http://www.w3.org/2001/XMLSchema",
		"_xmlns:altinn": "www.altinn.no/infopath-extensions",
		"_attributeFormDefault": "unqualified",
		"_elementFormDefault": "qualified",
		"__prefix": "xs"
	}
}