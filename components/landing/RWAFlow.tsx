'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  FileText,
  Coins,
  Shield,
  Users,
  ArrowRight
} from 'lucide-react';

const flowSteps = [
  {
    icon: <Upload className="h-6 w-6" />,
    title: 'Asset Onboarding',
    description: 'Submit real-world assets with comprehensive documentation and due diligence materials.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'SPV Creation',
    description: 'Establish Special Purpose Vehicle with legal structure and regulatory compliance.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Coins className="h-6 w-6" />,
    title: 'Tokenization',
    description: 'Convert asset ownership into blockchain tokens with smart contract deployment.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Compliance & KYC',
    description: 'Verify investor eligibility through automated KYC/AML checks and regulatory compliance.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Investor Access',
    description: 'Enable qualified investors to purchase tokens and access real-world yields.',
    color: 'from-indigo-500 to-purple-500',
  },
];

export function RWAFlow() {
  return (
    <section className="w-full py-24 px-6 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">RWA Tokenization Flow</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From real-world assets to on-chain tokens in five streamlined steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Lines - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {flowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Arrow between steps - Mobile/Tablet */}
                {index < flowSteps.length - 1 && (
                  <div className="lg:hidden absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-primary/40" />
                  </div>
                )}

                <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full group hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-6">
                    <motion.div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.icon}
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <div className="mt-4 text-xs font-medium text-primary">
                      Step {index + 1}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

