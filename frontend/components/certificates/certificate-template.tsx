'use client'

import Image from 'next/image'

interface CertificateTemplateProps {
  certificateNumber: string
  recipientName: string
  courseName: string
  issueDate: string
  verificationCode: string
}

export default function CertificateTemplate({
  certificateNumber,
  recipientName,
  courseName,
  issueDate,
  verificationCode
}: CertificateTemplateProps) {
  return (
    <div className="w-full bg-white p-8 shadow-2xl" style={{ aspectRatio: '1.414/1', maxWidth: '1200px' }}>
      {/* Decorative Border */}
      <div className="border-8 border-double border-blue-900 h-full relative p-6">
        {/* Inner Border */}
        <div className="border-2 border-blue-300 h-full relative p-6 flex flex-col overflow-hidden">

          {/* DynPro Logo */}
          <div className="flex justify-center mb-4 mt-2">
            <div className="relative w-48 h-16">
              <Image
                src="/dynpro-logo.png"
                alt="DynPro"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-4">
            <h1 className="text-4xl font-serif font-bold text-blue-900 mb-1 tracking-wide">
              CERTIFICATE
            </h1>
            <h2 className="text-xl font-serif text-gray-700 tracking-widest">
              OF COMPLETION
            </h2>
          </div>

          {/* Decorative Line */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
            <p className="text-base text-gray-600 mb-3 font-light">
              This is to certify that
            </p>

            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2 px-6 break-words max-w-full">
              {recipientName}
            </h3>

            <p className="text-base text-gray-600 mb-3 font-light">
              has successfully completed the training program
            </p>

            <h4 className="text-xl font-semibold text-blue-800 mb-4 px-4 break-words max-w-full">
              {courseName}
            </h4>

            <p className="text-sm text-gray-600 mb-4 max-w-2xl leading-relaxed">
              This certificate demonstrates commitment to professional development and
              achievement of competencies required to complete this training program.
            </p>
          </div>

          {/* Bottom Section */}
          <div className="border-t-2 border-gray-200 pt-4 mt-auto">
            <div className="grid grid-cols-2 gap-6 mb-3">
              {/* Issue Date */}
              <div className="text-center">
                <div className="border-b-2 border-gray-400 pb-1 mb-1 mx-auto w-40">
                  <p className="text-xs font-semibold text-gray-800">
                    {new Date(issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Issue Date</p>
              </div>

              {/* Signature */}
              <div className="text-center">
                <div className="border-b-2 border-gray-400 pb-1 mb-1 mx-auto w-40">
                  <p className="text-lg text-gray-800 italic">DynPro Training</p>
                </div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Authorized Signature</p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="flex justify-between items-center text-xs text-gray-500 px-2">
              <div className="truncate max-w-[45%]">
                <span className="font-semibold">Certificate No:</span> {certificateNumber}
              </div>
              <div className="truncate max-w-[45%]">
                <span className="font-semibold">Verification:</span> {verificationCode}
              </div>
            </div>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-blue-300"></div>
          <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-blue-300"></div>
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-blue-300"></div>
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-blue-300"></div>
        </div>
      </div>
    </div>
  )
}
