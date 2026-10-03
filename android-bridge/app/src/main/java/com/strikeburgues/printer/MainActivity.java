package com.strikeburgues.printer;

import android.Manifest;
import android.app.*;
import android.bluetooth.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.*;
import android.webkit.*;
import android.widget.Toast;
import java.io.*;
import java.net.Socket;
import java.util.*;

public class MainActivity extends Activity {
    // TROQUE pelo endereço que o Render fornecer para seu serviço.
    private static final String APP_URL = "https://SEU-SERVICO.onrender.com";
    private WebView web;

    @Override public void onCreate(Bundle b){ super.onCreate(b); web=new WebView(this); setContentView(web); setup(); }
    private void setup(){
        WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient()); web.addJavascriptInterface(new PrinterBridge(this), "StrikePrinter"); web.loadUrl(APP_URL);
        if(Build.VERSION.SDK_INT>=31 && checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.BLUETOOTH_CONNECT,Manifest.permission.BLUETOOTH_SCAN},77);
    }

    public static class PrinterBridge {
        private final MainActivity a;
        PrinterBridge(MainActivity x){a=x;}
        @JavascriptInterface public void printEscPos(String base64,String mode,String host,int port,String btName){
            new Thread(() -> { try {
                byte[] data=android.util.Base64.decode(base64,android.util.Base64.DEFAULT);
                if("network".equalsIgnoreCase(mode)) a.printTcp(data,host,port);
                else if("bluetooth".equalsIgnoreCase(mode)) a.printBluetooth(data,btName);
                else throw new Exception("Modo de impressão não suportado no app: "+mode);
                a.runOnUiThread(()->Toast.makeText(a,"Impressão enviada!",Toast.LENGTH_SHORT).show());
            }catch(Exception e){ a.runOnUiThread(()->Toast.makeText(a,"Falha: "+e.getMessage(),Toast.LENGTH_LONG).show()); }}).start();
        }
    }
    private void printTcp(byte[] data,String host,int port)throws Exception{
        if(host==null||host.trim().isEmpty())throw new Exception("Informe o IP da impressora.");
        try(Socket s=new Socket()){s.connect(new java.net.InetSocketAddress(host.trim(),port),5000);OutputStream o=s.getOutputStream();o.write(data);o.flush();}
    }
    private void printBluetooth(byte[] data,String wanted)throws Exception{
        BluetoothAdapter ad=BluetoothAdapter.getDefaultAdapter(); if(ad==null)throw new Exception("Celular sem Bluetooth.");
        if(!ad.isEnabled())throw new Exception("Ligue o Bluetooth do celular.");
        if(Build.VERSION.SDK_INT>=31 && checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT)!=PackageManager.PERMISSION_GRANTED)throw new Exception("Permissão Bluetooth não concedida.");
        Set<BluetoothDevice> ds=ad.getBondedDevices(); BluetoothDevice target=null;
        for(BluetoothDevice d:ds){ if(wanted!=null&&!wanted.isEmpty()&&wanted.equalsIgnoreCase(d.getName())){target=d;break;} }
        if(target==null && ds.size()==1)target=ds.iterator().next();
        if(target==null)throw new Exception("Pareie a impressora no Android e informe o nome Bluetooth nas configurações.");
        UUID spp=UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
        BluetoothSocket sock=target.createRfcommSocketToServiceRecord(spp);sock.connect();OutputStream o=sock.getOutputStream();o.write(data);o.flush();sock.close();
    }
}
