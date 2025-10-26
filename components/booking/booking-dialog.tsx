"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { D3Calendar } from "@/components/ui/d3-calendar"
import { ClockTimePicker } from "@/components/ui/clock-time-picker"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MessageSquare,
  User,
  Mail,
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Professional {
  id: string
  name: string
  title: string
  image?: string
}

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professional: Professional
}

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
]

const SESSION_PRICES = {
  video: 1500,
  phone: 1200,
  chat: 1000,
}

type BookingStep = "details" | "payment" | "success"
type SessionMode = "video" | "phone" | "chat"

export function BookingDialog({ open, onOpenChange, professional }: BookingDialogProps) {
  const [step, setStep] = useState<BookingStep>("details")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [sessionMode, setSessionMode] = useState<SessionMode>("video")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhoneNumber] = useState("")
  const [notes, setNotes] = useState("")

  const sessionPrice = SESSION_PRICES[sessionMode]
  const gst = Math.round(sessionPrice * 0.18)
  const totalAmount = sessionPrice + gst

  const handleContinueToPayment = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time")
      return
    }
    setStep("payment")
  }

  const handlePaymentSuccess = () => {
    setStep("success")
    setTimeout(() => {
      onOpenChange(false)
      // Reset form after closing
      setTimeout(() => {
        setStep("details")
        setSelectedDate(new Date())
        setSelectedTime("")
        setSessionMode("video")
        setName("")
        setEmail("")
        setPhoneNumber("")
        setNotes("")
      }, 300)
    }, 3000)
  }

  const handleBack = () => {
    setStep("details")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Book Session with {professional.name}
              </DialogTitle>
              <DialogDescription>{professional.title}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Session Mode Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Session Mode
                </Label>
                <RadioGroup value={sessionMode} onValueChange={(v) => setSessionMode(v as SessionMode)}>
                  <div className="grid gap-3">
                    <div
                      className={cn(
                        "flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all gap-3",
                        sessionMode === "video" ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSessionMode("video")}
                    >
                      <RadioGroupItem value="video" id="video" />
                      <Label htmlFor="video" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <span>Video Call</span>
                          </div>
                          <span className="font-semibold">₹{SESSION_PRICES.video}</span>
                        </div>
                      </Label>
                    </div>

                    <div
                      className={cn(
                        "flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all gap-3",
                        sessionMode === "phone" ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSessionMode("phone")}
                    >
                      <RadioGroupItem value="phone" id="phone" />
                      <Label htmlFor="phone" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>Phone Call</span>
                          </div>
                          <span className="font-semibold">₹{SESSION_PRICES.phone}</span>
                        </div>
                      </Label>
                    </div>

                    <div
                      className={cn(
                        "flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all gap-3",
                        sessionMode === "chat" ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSessionMode("chat")}
                    >
                      <RadioGroupItem value="chat" id="chat" />
                      <Label htmlFor="chat" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Text Chat</span>
                          </div>
                          <span className="font-semibold">₹{SESSION_PRICES.chat}</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Select Date
                </Label>
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-background to-primary/5 p-4 shadow-sm">
                  <D3Calendar
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date: Date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      maxDate.setHours(0, 0, 0, 0)
                      const checkDate = new Date(date)
                      checkDate.setHours(0, 0, 0, 0)
                      return checkDate < today || checkDate > maxDate
                    }}
                    className=""
                  />
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Select Time
                </Label>
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-background to-primary/5 p-6 shadow-sm">
                  <ClockTimePicker
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                    availableTimes={TIME_SLOTS}
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific concerns or topics you'd like to discuss..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Price Summary */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session Fee</span>
                  <span>₹{sessionPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%)</span>
                  <span>₹{gst}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleContinueToPayment} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Continue to Payment
              </Button>
            </div>
          </>
        )}

        {step === "payment" && (
          <RazorpayMockup
            amount={totalAmount}
            professional={professional}
            sessionDetails={{
              mode: sessionMode,
              date: selectedDate!,
              time: selectedTime,
              name,
              email,
            }}
            onSuccess={handlePaymentSuccess}
            onBack={handleBack}
          />
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <DialogTitle className="text-2xl">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-base">
              Your session has been successfully booked. You will receive a confirmation email shortly.
            </DialogDescription>
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Professional:</span>
                <span className="font-medium">{professional.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{selectedDate && format(selectedDate, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium capitalize">{sessionMode}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface RazorpayMockupProps {
  amount: number
  professional: Professional
  sessionDetails: {
    mode: string
    date: Date
    time: string
    name: string
    email: string
  }
  onSuccess: () => void
  onBack: () => void
}

function RazorpayMockup({ amount, professional, sessionDetails, onSuccess, onBack }: RazorpayMockupProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  const handlePayment = () => {
    setProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      onSuccess()
    }, 2000)
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-[#0C2C6C] flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              Razorpay Payment Gateway
            </DialogTitle>
            <DialogDescription>Secure payment powered by Razorpay</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Order Summary */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session with {professional.name}</span>
              <span className="font-medium">₹{amount}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{format(sessionDetails.date, "PPP")} at {sessionDetails.time}</span>
            </div>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">₹{amount}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Payment Method</Label>
          <div className="grid gap-2">
            <div
              className={cn(
                "flex items-center space-x-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                paymentMethod === "card" ? "border-[#0C2C6C] bg-[#0C2C6C]/5" : "border-border"
              )}
              onClick={() => setPaymentMethod("card")}
            >
              <RadioGroupItem value="card" id="card-payment" checked={paymentMethod === "card"} />
              <Label htmlFor="card-payment" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Credit / Debit Card</span>
                </div>
              </Label>
            </div>

            <div
              className={cn(
                "flex items-center space-x-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                paymentMethod === "upi" ? "border-[#0C2C6C] bg-[#0C2C6C]/5" : "border-border"
              )}
              onClick={() => setPaymentMethod("upi")}
            >
              <RadioGroupItem value="upi" id="upi-payment" checked={paymentMethod === "upi"} />
              <Label htmlFor="upi-payment" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-gradient-to-br from-orange-500 to-green-600" />
                  <span>UPI</span>
                </div>
              </Label>
            </div>

            <div
              className={cn(
                "flex items-center space-x-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                paymentMethod === "netbanking" ? "border-[#0C2C6C] bg-[#0C2C6C]/5" : "border-border"
              )}
              onClick={() => setPaymentMethod("netbanking")}
            >
              <RadioGroupItem value="netbanking" id="netbanking-payment" checked={paymentMethod === "netbanking"} />
              <Label htmlFor="netbanking-payment" className="flex-1 cursor-pointer">
                <span>Net Banking</span>
              </Label>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {paymentMethod === "card" && (
          <div className="space-y-4 border rounded-lg p-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "upi" && (
          <div className="space-y-4 border rounded-lg p-4">
            <div className="space-y-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                placeholder="example@upi"
                type="text"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your UPI ID to complete the payment
            </p>
          </div>
        )}

        {paymentMethod === "netbanking" && (
          <div className="space-y-4 border rounded-lg p-4">
            <div className="space-y-2">
              <Label htmlFor="bank-select">Select Your Bank</Label>
              <select 
                id="bank-select"
                title="Select Your Bank"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={processing} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={processing}
          className="flex-1 bg-[#0C2C6C] hover:bg-[#0C2C6C]/90"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              Pay ₹{amount}
            </>
          )}
        </Button>
      </div>
    </>
  )
}
