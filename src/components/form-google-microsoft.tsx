import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { SubmitHandler } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group'
import 'react-phone-number-input/style.css'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'

// 🔥 Máscaras para CPF e CNPJ
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
    .slice(0, 14)
}

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

// 🔥 Função de validação de CPF
const validateCPF = (cpf: string) => {
  cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let sum = 0
  let remainder: number
  for (let i = 1; i <= 9; i++) sum += Number.parseInt(cpf[i - 1]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cpf[9])) return false

  sum = 0
  for (let i = 1; i <= 10; i++) sum += Number.parseInt(cpf[i - 1]) * (12 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === Number.parseInt(cpf[10])
}

// 🔥 Função de validação de CNPJ
const validateCNPJ = (cnpj: string) => {
  cnpj.replace(/\D/g, '')
  if (cnpj.length !== 14) return false

  if (/^(\d)\1+$/.test(cnpj)) return false

  const validateDigit = (cnpj: string, length: number) => {
    let sum = 0
    let pos = length - 7
    for (let i = length; i >= 1; i--) {
      sum += Number.parseInt(cnpj[length - i]) * pos--
      if (pos < 2) pos = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }

  return (
    validateDigit(cnpj, 12) === Number.parseInt(cnpj[12]) &&
    validateDigit(cnpj, 13) === Number.parseInt(cnpj[13])
  )
}

const allowedMimeTypes = [
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/pdf', // .pdf
]

// 🔥 Validação do formulário
const formSchema = z.object({
  name: z.string().min(2, 'Este campo deve ter pelo menos 2 caracteres'),
  document: z
    .string()
    .min(14, 'CPF/CNPJ inválido')
    .refine(value => {
      const onlyNumbers = value.replace(/\D/g, '')
      return onlyNumbers.length === 11
        ? validateCPF(onlyNumbers)
        : validateCNPJ(onlyNumbers)
    }, 'CPF/CNPJ inválido'),
  email: z.string().email('Digite o e-mail corretamente.'),
  phone: z
    .string()
    .min(1, 'O telefone é obrigatório')
    .refine(phone => isValidPhoneNumber(phone), {
      message: 'Número de telefone inválido',
    }),
  position: z.string().min(2, 'Este campo deve ter pelo menos 2 caracteres'),
  company: z.string().min(2, 'Este campo deve ter pelo menos 2 caracteres'),
  city: z.enum(['São Paulo', 'Brasília'], {
    required_error: '',
  }),
  option: z.enum(
    ['Quero ir ao evento', 'Quero apresentar minha proposta no evento'],
    { required_error: '' }
  ),
  proposalText: z.string().optional(),
  files: z
    .instanceof(FileList)
    .optional()
    .refine(
      fileList => !fileList || fileList.length <= 2,
      'Máximo de 2 arquivos permitidos'
    )
    .refine(
      fileList =>
        !fileList ||
        Array.from(fileList).every(file => file.size <= 30 * 1024 * 1024), // 30MB por arquivo
      'Cada arquivo deve ter no máximo 30MB'
    )
    .refine(
      fileList =>
        !fileList ||
        Array.from(fileList).every(file =>
          allowedMimeTypes.includes(file.type)
        ), // Verifica se o formato é aceito
      'Os formatos permitidos são: .doc, .docx, .ppt, .pptx e .pdf'
    ),
  optin1: z.enum(['Aceite1'], {
    required_error: '',
  }),
  optin2: z.enum(['Aceite2'], {
    required_error: '',
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function UploadForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      document: '',
      email: '',
      phone: '',
      position: '',
      company: '',
      proposalText: '',
    },
  })

  const [, setDocumentType] = useState<'cpf' | 'cnpj' | null>(null)

  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('0%')
  const convertFileToBase64 = (
    file: File,
    onProgress: (percentage: number) => void // 🔥 Definindo o tipo correto para `percentage`
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      let loaded = 0
      const total = file.size
      const interval = setInterval(() => {
        loaded += total * 0.1
        const percent = Math.min((loaded / total) * 100, 100)
        onProgress(percent) // ✅ Agora `percentage` tem um tipo explícito
        if (loaded >= total) clearInterval(interval)
      }, 200)

      reader.onload = () =>
        resolve(reader.result?.toString().split(',')[1] || '')
      reader.onerror = error => reject(error)
    })
  }
  const selectedOption = form.watch('option') // 🔥 Observa a opção selecionada no ToggleGroup

  const API_BASE_URL = 'https://editora-backend-form.vercel.app/api'
  // const API_BASE_URL = 'http://localhost:3000'

  const onSubmit: SubmitHandler<FormValues> = async data => {
    if (isUploading) return
    setIsUploading(true)
    setProgress(5)
    setProgressText('5%')

    try {
      const files = data.files ? Array.from(data.files) : []
      const uploadedLinks: string[] = []
      let folderUrl = ''

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const fileBase64 = await convertFileToBase64(
          file,
          (percentage: number) => {
            const overallProgress = Math.min(
              percentage + i * (100 / files.length),
              100
            )
            setProgress(overallProgress)
            setProgressText(`${Math.round(overallProgress)}%`)
          }
        )

        const payload = {
          folderName: data.name,
          fileName: file.name,
          mimeType: file.type,
          file: fileBase64,
        }

        // 🔥 Enviar arquivo para o backend na Vercel (Google Drive)
        const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResult.success) {
          toast({
            title: 'Erro',
            description: `Falha ao enviar o arquivo ${file.name}`,
            variant: 'destructive',
          })
          setIsUploading(false)
          setProgress(0)
          setProgressText('0%')
          return
        }

        uploadedLinks.push(uploadResult.fileUrl)
        folderUrl = uploadResult.folderUrl
      }

      setProgress(100)
      setProgressText('100%')

      // 🔥 Enviar link da pasta para o Google Forms
      const googleFormURL =
        'https://docs.google.com/forms/d/e/1FAIpQLSdG84Czkkh9Sc7AfwRP1p0ketSx40ZTgybZ3zREJElT6MWgDQ/formResponse'
      const googleFormData = new URLSearchParams()
      googleFormData.append('entry.810983269', data.name)
      googleFormData.append('entry.2033388712', folderUrl) // 🔥 Link da pasta

      await fetch(googleFormURL, {
        method: 'POST',
        body: googleFormData,
        mode: 'no-cors',
      })

      // 🔥 Enviar link da pasta para o Microsoft Forms via Vercel
      const microsoftPayload = {
        startDate: new Date().toISOString(),
        submitDate: new Date().toISOString(),
        answers: JSON.stringify([
          {
            questionId: 'r3c6a45fa6d654247a87f78c34ad3b3c1',
            answer1: data.name,
          },
          {
            questionId: 'rb424c943b5d7431382de9a81e913790b',
            answer1: data.document,
          },
          {
            questionId: 'r1ea4091eac0547d783fbc453c58eb0e1',
            answer1: data.email,
          },
          {
            questionId: 'r60c09685f59747d9b272767acb69b4ec',
            answer1: data.phone,
          },
          {
            questionId: 'r685776979d034f62b56e77d832c98162',
            answer1: data.position,
          },
          {
            questionId: 'ref97b1e323c44a72a0c456dd972f9138',
            answer1: data.company,
          },
          {
            questionId: 'r659fa6e017c84f58af9b58caf18d7c0e',
            answer1: data.city,
          },
          {
            questionId: 'rba318cce25cd49e684afae566ddd9394',
            answer1: data.option,
          },
          {
            questionId: 'r7e27320310924503a4e033b76d35fd7c',
            answer1: data.proposalText,
          },
          {
            questionId: 'r162a182549624c359abd002ca0f577c2',
            answer1: folderUrl,
          },
          {
            questionId: 'reac3f882283448c3a041447117c025f6',
            answer1: data.optin1,
          },
          {
            questionId: 'rb4604b552bd842f3ab99e3f51979ad32',
            answer1: data.optin2,
          },
        ]),
      }

      console.log('Payload para Microsoft Forms:', microsoftPayload)
      await fetch(`${API_BASE_URL}/submit-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(microsoftPayload),
      })

      toast({
        title: 'Sucesso!',
        description: 'Arquivos e respostas enviadas!',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar os dados',
        variant: 'destructive',
      })
      console.error(error)
      form.reset()
      setProgress(0)
      setProgressText('0%')
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
        setProgressText('0%')
      })
    }
  }

  // 🔥 Manipula entrada do CPF/CNPJ e define a máscara correta
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Remove caracteres não numéricos
    let formattedValue = value

    if (value.length <= 11) {
      formattedValue = formatCPF(value)
      setDocumentType('cpf')
    } else {
      formattedValue = formatCNPJ(value)
      setDocumentType('cnpj')
    }

    form.setValue('document', formattedValue)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-10 ">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Cadastro</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo Nome */}
            <div className="flex flex-col md:flex-row  md:gap-3 gap-0 space-y-4 md:space-y-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="CPF/CNPJ"
                        onChange={handleDocumentChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col md:flex-row  md:gap-3 gap-0 space-y-4 md:space-y-0">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="E-mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <PhoneInput
                        {...field}
                        placeholder="Digite seu telefone"
                        international
                        defaultCountry="BR"
                        value={field.value || ''} // 🔥 Evita undefined no valor inicial
                        onChange={value => {
                          form.setValue('phone', value || '', {
                            shouldValidate: true,
                          })
                        }}
                        className="border px-2 rounded-md mt-1 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row  md:gap-3 gap-0 space-y-4 md:space-y-0">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Cargo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo Cidade (RadioGroup) */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecione a cidade:</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex gap-2 items-center">
                      <FormControl>
                        <RadioGroupItem className="mt-2" value="São Paulo" />
                      </FormControl>
                      <FormLabel>São Paulo</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-2 items-center">
                      <FormControl>
                        <RadioGroupItem className="mt-2" value="Brasília" />
                      </FormControl>
                      <FormLabel>Brasília</FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            <hr />
            <FormField
              control={form.control}
              name="option"
              render={({ field }) => (
                <FormItem className="pt-10">
                  <ButtonGroup
                    value={field.value} // Valor controlado
                    onValueChange={value => field.onChange(value)} // Atualiza o estado
                    className="flex justify-center"
                  >
                    {/* Botão "Quero ir ao evento" */}
                    <ButtonGroupItem
                      className="uppercase w-full md:w-72"
                      value="Quero ir ao evento"
                      icon={''}
                      label="Quero ir ao evento"
                    />

                    {/* Botão "Quero apresentar minha proposta no evento" */}
                    <ButtonGroupItem
                      className="uppercase w-full md:w-72"
                      value="Quero apresentar minha proposta no evento"
                      icon={''}
                      label="Quero apresentar minha proposta no evento"
                    />
                  </ButtonGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Opção de Participação (ToggleGroup) */}

            <div
              className={`transition-all duration-1000 ease-in-out overflow-hidden border p-3 rounded-lg bg-zinc-100 ${
                selectedOption === 'Quero apresentar minha proposta no evento'
                  ? 'opacity-100 max-h-[600px] translate-y-0'
                  : 'opacity-0 max-h-0 translate-y-[-10px]'
              }`}
            >
              {/* Campo Proposta */}
              <FormField
                control={form.control}
                name="proposalText"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="DIGITE A SUA PROPOSTA OU COLE O LINK DE SERVIÇO NA NUVEM."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Arquivos */}
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Você também pode anexar um arquivo PDF (Acrobat), DOC/DOCX
                      (Word) ou PPT/PPTX (PowerPoint):
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={e => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <hr />
            <FormField
              control={form.control}
              name="optin1"
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex gap-2 items-center">
                      <FormControl>
                        <RadioGroupItem className="mt-2" value="Aceite1" />
                      </FormControl>
                      <FormLabel className="leading-tight">
                        Li e concordo com os{' '}
                        <a
                          className="text-zinc-400 hover:text-zinc-700"
                          href="https://privacidade.globo.com/privacy-policy/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Termos de Uso e Política de Privacidade do Grupo Globo
                        </a>
                        .
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="optin2"
              render={({ field }) => (
                <FormItem>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex gap-2 items-center">
                      <FormControl>
                        <RadioGroupItem className="mt-2" value="Aceite2" />
                      </FormControl>
                      <FormLabel className="leading-tight">
                        Estou ciente e concordo que os meus dados constantes
                        nesta inscrição podem ser utilizados pela Editora Globo,
                        por empresas do Grupo Globo e por patrocinadores do
                        evento para fins de ações de relacionamento, como envio
                        de ofertas de produtos e/ou serviços.
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            <hr />
            <p className="leading-tight text-sm">
              OBS.: Para informações sobre credenciamento de jornalistas e
              possibilidade de cobertura do evento pela imprensa, por favor
              enviar e-mail para editoraglobo@inpresspni.com.br
            </p>
            {/* Barra de Progresso */}
            {isUploading && (
              <div className="relative w-full">
                <Progress value={progress} className="h-5 w-full" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-zinc-400">
                  {progressText}
                </span>
              </div>
            )}

            {/* Botão de Enviar */}
            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                'Enviar'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
