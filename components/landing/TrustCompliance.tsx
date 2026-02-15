'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileCheck, Scale, Lock, CheckCircle2 } from 'lucide-react';

const complianceFeatures = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'KYC/AML Compliance',
    description: 'Automated identity verification and anti-money laundering checks for all participants.',
    color: 'border-blue-500/30 hover:border-blue-500/60',
    glow: 'hover:shadow-blue-500/20',
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: 'Regular Audits',
    description: 'Third-party audits and compliance reviews conducted quarterly by leading firms.',
    color: 'border-green-500/30 hover:border-green-500/60',
    glow: 'hover:shadow-green-500/20',
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: 'Regulatory First',
    description: 'Built with regulatory compliance as a core principle, not an afterthought.',
    color: 'border-purple-500/30 hover:border-purple-500/60',
    glow: 'hover:shadow-purple-500/20',
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'Smart Contracts',
    description: 'Audited smart contracts with formal verification and bug bounty programs.',
    color: 'border-orange-500/30 hover:border-orange-500/60',
    glow: 'hover:shadow-orange-500/20',
  },
];

export function TrustCompliance() {
  return (
    <section className="w-full py-24 px-6 md:px-8 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Regulatory-First Platform</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trust & Compliance</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Institutional-grade security and compliance infrastructure you can trust
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {complianceFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                className={`border-2 ${feature.color} ${feature.glow} transition-all duration-300 bg-card/50 backdrop-blur-sm h-full group`}
              >
                <CardContent className="p-6">
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
         
        </motion.div>
      </div>
    </section>
  );
}

