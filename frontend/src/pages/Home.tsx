import React, { useState } from 'react';
import { NavLink, useOutletContext } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

import { submitQuery } from '@/api/HXAPI';
import { HXQueryPostReq } from '@/lib/HXTypes'

interface LayoutContextType {
  triggerSidebarRefresh: () => void;
}

function Home() {
  // State variables for form steps and field values
  const [activeFormStep, setActiveFormStep] = useState(1);
  const [slhasherQueryHashes, setSlhasherQueryHashes] = useState<string>('');
  const [slhasherQueryCaseName, setSlhasherQueryCaseName] = useState<string>('');
  const [slhasherQueryCaseAnalyst, setSlhasherQueryCaseAnalyst] = useState<string>('');
  
  // Unique lowercase hashes
  const [uniqueHashes, setUniqueHashes] = useState<string[]>([]);

  // Validation states for fields
  const [isHashesValid, setIsHashesValid] = useState(true);
  const [isCaseNameValid, setIsCaseNameValid] = useState(true);
  const [isAnalystValid, setIsAnalystValid] = useState(true);

  // Sidebar refresh trigger from outlet
  const { triggerSidebarRefresh } = useOutletContext<LayoutContextType>();

  // Toast messages
  const { toast } = useToast()

  // Form stepper labels
  const formStepLabels = [
    { id: 1, label: 'Step 1', title: 'Hash Values' },
    { id: 2, label: 'Step 2', title: 'Query Details' },
    { id: 3, label: 'Step 3', title: 'Query Summary' },
  ];

  const handleSubmitSlhasherQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Prevent page reloading on form submit

    // Create the query object using the proper SlhasherQuery interface
    const slhasherQuery: HXQueryPostReq = {
      query: {
        query_analyst: slhasherQueryCaseAnalyst,
        query_case_name: slhasherQueryCaseName,
      },
      // Split hashes by newlines, trim whitespace, and filter out empty strings
      hashes: slhasherQueryHashes.split('\n').map(hash => hash.trim()).filter(hash => hash !== '')
    };

    try {
      const result = await submitQuery(slhasherQuery);
      if (result.success) {
        setSlhasherQueryHashes('');
        setSlhasherQueryCaseName('');
        setSlhasherQueryCaseAnalyst('');
        setActiveFormStep(1);
        triggerSidebarRefresh();

        toast({
          title: <div className='text-[#92E8A3]'>Operation Successful</div>,
          description: 'The Slhasher query has been created successfully. You can now view the query results.',
          action: <ToastAction altText='View query results'><NavLink to={`/queries/${result.data.id}`}>View Results</NavLink></ToastAction>,
        })
      }
    } catch (error) {}
  };

  // Hashes validation logic (lowercase and unique, all lines should be valid, no empty input)
  const validateHashes = () => {
    const sha256Regex = /^[a-f0-9]{64}$/;
    const hashes = slhasherQueryHashes
      .split('\n')
      .map(hash => hash.trim().toLowerCase())
      .filter(hash => hash !== ''); // Remove empty lines

    // Check if every hash matches the SHA256 regex pattern
    const allValid = hashes.length > 0 && hashes.every(hash => sha256Regex.test(hash));
    setIsHashesValid(allValid);
    
    // Store unique valid hashes in state if all are valid
    if (allValid) {
      setUniqueHashes([...new Set(hashes)]);
    }
    
    return allValid;
  };

  // Case name validation (alphanumeric, max 256 chars)
  const validateCaseName = () => {
    const isValid = /^[a-zA-Z0-9\s]+$/.test(slhasherQueryCaseName) && slhasherQueryCaseName.length <= 256;
    setIsCaseNameValid(isValid);
    return isValid;
  };

  // Analyst name validation (alphanumeric, max 128 chars)
  const validateAnalystName = () => {
    const isValid = /^[a-zA-Z0-9\s]+$/.test(slhasherQueryCaseAnalyst) && slhasherQueryCaseAnalyst.length <= 128;
    setIsAnalystValid(isValid);
    return isValid;
  };

  // Handle moving to the next step
  const handleNext = () => {
    let isStepValid = true;

    if (activeFormStep === 1) {
      isStepValid = validateHashes();
    } else if (activeFormStep === 2) {
      const caseValid = validateCaseName();
      const analystValid = validateAnalystName();
      isStepValid = caseValid && analystValid;
    }

    if (isStepValid) {
      setActiveFormStep(prev => prev + 1);
    }
  };

  return (
    <main className='grid gap-24'>
      {/* Page header */}
      <section className='mb-8 pb-8 border-b'>
        <h1 className='text-3xl mb-2'>Bulk Hash Lookup</h1>
        <p className='text-secondary-foreground'>Query multiple SHA256 hash values at once.</p>
      </section>
      <section className='flex'>
        {/* Stepper sidebar */}
        <section className='w-96 relative'>
          {formStepLabels.map((step, index) => (
            <div className='flex items-center gap-6 relative' key={index}>
              <div className='flex flex-col items-center'>
                <span
                  style={{ transition: 'background-color 0.3s ease' }}
                  className={`w-10 h-10 flex justify-center items-center rounded-full border ${
                    step.id <= activeFormStep ? 'bg-primary text-background' : ''
                  }`}
                >
                  {step.id}
                </span>
                {/* Vertical Line: shown only if it's not the last step */}
                {step.id < formStepLabels.length && (
                  <div
                    style={{ transition: 'background-color 0.3s ease' }}
                    className={`w-[2px] h-16 ${step.id < activeFormStep ? 'bg-primary' : 'bg-border'}`}
                  ></div>
                )}
              </div>
              <div className={`leading-tight ${index < formStepLabels.length - 1 ? 'relative -top-8' : ''}`}>
                <p className='text-secondary-foreground font-light'>{step.label}</p>
                <h3>{step.title}</h3>
              </div>
            </div>
          ))}
        </section>
        {/* Main content */}
        <section className='w-full grid gap-24'>
          <div className='min-h-[250px]'>
            <form className='h-full' onSubmit={handleSubmitSlhasherQuery}>
              <h2 className='text-2xl mb-12'>{formStepLabels[activeFormStep - 1].title}</h2>

              {activeFormStep === 1 && (
                <div style={{ height: 'calc(100% - 100px)' }}>
                  <Textarea
                    name='slhasherHashes'
                    value={slhasherQueryHashes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSlhasherQueryHashes(e.target.value)}
                    onBlur={validateHashes}
                    placeholder='Enter SHA256 hash values separated by newlines'
                    className={`bg-secondary text-secondary-foreground h-full ${!isHashesValid ? 'border-[#FF8C8C]' : ''}`}
                    required
                  />
                  {!isHashesValid && (
                    <small className='text-[#FF8C8C]'>
                      Please enter valid SHA256 values, each separated by a newline. Ensure at least one hash value is provided.
                    </small>
                  )}
                </div>
              )}

              {activeFormStep === 2 && (
                <div className='flex w-full gap-24'>
                  <div className='w-full'>
                    <Label htmlFor='slhasherCaseName' className='block mb-4'>
                      Case ID / Case Name (max 256 chars, alphanumeric)
                    </Label>
                    <Input
                      type='text'
                      name='slhasherCaseName'
                      value={slhasherQueryCaseName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlhasherQueryCaseName(e.target.value)}
                      onBlur={validateCaseName}
                      placeholder='Case 123456'
                      className={`bg-secondary text-secondary-foreground ${!isCaseNameValid ? 'border-[#FF8C8C]' : ''}`}
                      required
                    />
                    {!isCaseNameValid && <small className='text-[#FF8C8C]'>Please enter a valid alphanumeric case name (max 256 chars).</small>}
                  </div>

                  <div className='w-full'>
                    <Label htmlFor='slhasherCaseAnalyst' className='block mb-4'>
                      Case Analyst's Name (max 128 chars, alphanumeric)
                    </Label>
                    <Input
                      type='text'
                      name='slhasherCaseAnalyst'
                      value={slhasherQueryCaseAnalyst}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlhasherQueryCaseAnalyst(e.target.value)}
                      onBlur={validateAnalystName}
                      placeholder="Analyst's Name"
                      className={`bg-secondary text-secondary-foreground ${!isAnalystValid ? 'border-[#FF8C8C]' : ''}`}
                      required
                    />
                    {!isAnalystValid && (<small className='text-[#FF8C8C]'>Please enter a valid alphanumeric analyst name (max 128 chars).</small>)}
                  </div>
                </div>
              )}

              {/* Summary Page */}
              {activeFormStep === 3 && (
                <div>
                  <p><strong>Case Name:</strong> {slhasherQueryCaseName}</p>
                  <p><strong>Analyst Name:</strong> {slhasherQueryCaseAnalyst}</p>
                  <p><strong>Unique Hashes:</strong> {uniqueHashes.length}</p>
                </div>
              )}
            </form>
          </div>

          {/* Navigation buttons */}
          <div className='flex justify-between'>
            <Button disabled={activeFormStep === 1} variant='outline' onClick={() => setActiveFormStep(activeFormStep - 1)}>
              <ChevronLeftIcon className='h-4 w-4' />
              <span>Previous</span>
            </Button>
            {activeFormStep !== formStepLabels.length && (
              <Button variant='outline' onClick={handleNext}>
                <span>Next</span>
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
            )}
            {activeFormStep === formStepLabels.length && (
              <Button variant='outline' onClick={handleSubmitSlhasherQuery}>
                <span>Submit</span>
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Home;
