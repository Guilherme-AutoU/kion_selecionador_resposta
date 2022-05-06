const express = require('express')
const app = express()
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')

const { Web, sp } = require('@pnp/sp')
const { PnpNode } = require('sp-pnp-node')

const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))

// HANDLE BARS
app.set('view engine', 'handlebars')
const hbs = exphbs.create({ defaultLayout: 'main' })
app.engine('handlebars', hbs.engine)
app.set('views', path.join(__dirname, 'views'))

// STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')))

var questionUsedApplication,
	alternativeUsedApplication,
	protoDepartUsedApplication,
	answerDetaUsedApplication,
	wayToAnswerUsedApplication,
	answerFilesUsedApplication,
   protocolIDUsedInApplication

// API SHAREPOINT
new PnpNode()
	.init()
	.then((settings) => {
		// Here goes PnP JS Core code >>>

		const web = new Web(settings.siteUrl)
   
      async function catchDataInSharepoint() {
         // QUESTIONS
         const questionList = await sp.web.lists
            .getByTitle('Perguntas')
            .items.getAll()

         const questionListJson = convertToStringAndJson(questionList)
         questionUsedApplication = alignQuestion(questionListJson)

         // Alternatives
         const alternativeList = await sp.web.lists
            .getByTitle('Alternativas')
            .items.getAll()

         const alternativeListJson = convertToStringAndJson(alternativeList)
         alternativeUsedApplication = alignAlternatives(alternativeListJson)

         // PROTOCOLS AND DEPARTAMENT
         const protoDepartList = await sp.web.lists
            .getByTitle('Protocolos e Departamentos')
            .items.getAll()

         const protoDepartListJson = convertToStringAndJson(protoDepartList)
         protoDepartUsedApplication = alignProtocolsAndDepartaments(protoDepartListJson)

         // ANSWER-DETAILS
         const answerDetaList = await sp.web.lists
            .getByTitle('Respostas-Detalhes')
            .items.getAll()

         const answerDetaListJson = convertToStringAndJson(answerDetaList)
         answerDetaUsedApplication = alignAnswerDetails(answerDetaListJson)

         // WAY TO ANSWER
         const wayToAnswerList = await sp.web.lists
            .getByTitle('Caminho para as Respostas')
            .items.getAll()

         const wayToAnswerListJson = convertToStringAndJson(wayToAnswerList)
         wayToAnswerUsedApplication = alignWayToAnswer(wayToAnswerListJson)

         // ANWSER FILES
         const answerFilesList = await sp.web.lists
            .getByTitle('Arquivos Resposta')
            .items // Faltou anexos
            .getAll()

         const answerFilesListJson = convertToStringAndJson(answerFilesList)
         
         const answerFiles = await sp.web.lists
            .getByTitle('Arquivos Resposta')
            .items // Faltou anexos
            .select("AttachmentFiles")
            .expand("AttachmentFiles")
            .getAll()
            
         const answerFilesJson = convertToStringAndJson(answerFiles)

         //answerFilesUsedApplication = alignAnswerFiles(answerFilesListJson, answerFilesJson)
         answerFilesUsedApplication = alignAnswerFiles(answerFilesListJson)

         // DATABASE FOR COLLABORATORS
         const collaborators = await sp.web.lists
            .getByTitle('Colaboradores')
            .items.getAll()

         const collaboratorsJson = convertToStringAndJson(collaborators)
         const collaboratorsUsedApplication = alignCollaborators(collaboratorsJson)

         const protocolID = await sp.web.lists
         .getByTitle('Protocolos_ID')
         .items
         .getAll()

         const protocolIDJson = convertToStringAndJson(protocolID)
          protocolIDUsedInApplication = alignProtocolID(protocolIDJson)
		}
		catchDataInSharepoint()

      //setInterval(catchDataInSharepoint, 1000);
	})
	.catch(console.log)

app.get('/question', (req, res) => {
	res.json(questionUsedApplication)
})

app.get('/alternative', (req, res) => {
	res.json(alternativeUsedApplication)
})

app.get('/proto&departament', (req, res) => {
	res.json(protoDepartUsedApplication)
})

app.get('/answerlist', (req, res) => {
	res.json(answerDetaUsedApplication)
})

app.get('/waytoanswer', (req, res) => {
	res.json(wayToAnswerUsedApplication)
})

app.get('/answerfiles', (req, res) => {
	res.json(answerFilesUsedApplication)
})

app.get('/protocolid', (req, res) => {
   res.json(protocolIDUsedInApplication)
})

app.get('/', (req, res) => {
	res.render('index')
})

// FUNCIONS TO HANDLE DATA
function alignQuestion(data) {
	let dataUsed = []
	data.forEach((item) => {
		dataUsed.push({
			Protocolo: item.Protocolo,
			Ordem: item.Ordem,
			ID: item.ID,
			Pergunta: item.Pergunta,
		})
	})

	return dataUsed
}

function alignAlternatives(data) {
	let dataUsed = []
	data.forEach((item) => {
		dataUsed.push({
			IdDaPergunta: item.ID_x0020_da_x0020_Pergunta,
			Alternativa: item.Alternativa,
			ID: item.ID,
			TipoDeAlternativa: item.Tipo_x0020_de_x0020_Alternativa,
			CorDeSelecao: item.Cor_x0020_de_x0020_Sele_x00e7__x,
			IDsAnteriores: alignAnteriores(item.IDs_x0020_Anteriores),
		})
	})

	return dataUsed
}

function alignAnteriores(string) {
	let newString = []
	if (string !== null) {
		newString = string.split('_')
	}

	for (let i = 0; i < newString.length; i++) {
		if (newString[i] == '') {
			newString.splice(i, 1)
		}
	}

	return newString
}

function alignProtocolsAndDepartaments(data) {
	let dataUsed = []
	data.forEach((item) => {
		dataUsed.push({
			Departamento: item.Departamento,
			Protocolo: item.Protocolo,
		})
	})

	return dataUsed
}

function alignAnswerDetails(data) {
	let dataUsed = []
	data.forEach((item) => {
		dataUsed.push({
			Resposta: item.Resposta,
			ID: item.ID,
			Descricao: item.Descri_x00e7__x00e3_o,
			Imagem: item.Imagem,
			Video: item.V_x00ed_deo,
			Detalhes: item.Detalhes,
		})
	})

	return dataUsed
}

function alignWayToAnswer(data) {
	let dataUsed = []
	data.forEach((item) => {
		dataUsed.push({
			Caminho: [
				item.IDdaAlternativa1,
				item.IDdaAlternativa2,
				item.IDdaAlternativa3,
				item.IDdaAlternativa4,
				item.IDdaAlternativa5,
				item.IDdaAlternativa6,
				item.IDdaAlternativa7,
				item.IDdaAlternativa8,
			],
			IDdaResposta: item.IDdaResposta,
			Protocolo: item.Protocolo,
		})
	})

	return dataUsed
}

function alignAnswerFiles(data, files) {
	let dataUsed = []
	data.forEach((item) => {
		dataUsed.push({
			TipoDeArquivo: item.TipodeArquivo,
			IDdaResposta: item.ID_x0020_da_x0020_Resposta,
         //Anexos: alignFiles(item.ID, files)
		})
	})

	return dataUsed
}

function alignFiles(id, files){
   for(let i = 0; i < files.length; i++){
      if(i + 1 == id){
         return files[i]
      }
   }
}

function alignCollaborators(data) {
	let dataUsed = []
	data.forEach((item) => {
		dataUsed.push({
			Nome: item.Title,
			Matricula: item.Matricula,
			Nascimento: alignBirth(item.Nascimento),
			CPF: item.CPF,
			Email: item.Email,
			Sexo: item.Sexo,
			Setor: item.Centro_x0020_de_x0020_Custo_x002,
			Departamento: item.Departamento,
			Funcao: item.Fun_x00e7__x00e3_o,
		})
	})

	return dataUsed
}

function alignBirth(data) {
	const newData = data.split('-')
	return `${newData[2].substring(0, 2)}/${newData[1]}/${newData[0]}`
}

function alignProtocolID(data) {
   let dataUsed = []
   data.forEach((item) => {
      dataUsed.push({
         Protocolo: item.Title,
         ID: item.ID
      })
   })

   return dataUsed
}

// CONVERT TO STRING, BEFORE CONVERT TO JSON
function convertToStringAndJson(data) {
	const string = JSON.stringify(data)
	const json = JSON.parse(string)
	return json
}

app.listen(PORT, function () {
	console.log('O Express está rodando na porta ' + PORT)
})
